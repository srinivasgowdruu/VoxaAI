import os
import time
import json
import re

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from pydantic import BaseModel
from dotenv import load_dotenv

class VoxaAIResponse(BaseModel):
    language: str
    translation: str
    is_visual_command: bool
    visual_description: str
    drawing_svg: str
    bpmn_xml: str

# =========================================================
# AI WORKFLOW ANALYSIS RESPONSE
# =========================================================

class BPMNAnalysisResponse(BaseModel):
    summary: str
    strengths: list[str]
    issues: list[str]
    automation_opportunities: list[str]
    recommendations: list[str]

# AI DOCUMENTATION RESPONSE

class BPMNDocumentationResponse(BaseModel):
    process_overview: str
    workflow_steps: list[str]
    business_rules: list[str]
    key_decisions: list[str]
    roles_responsibilities: list[str]

# =========================================================
# VOXAAI
# MULTILINGUAL SPEECH TRANSLATOR
# =========================================================

app = Flask(__name__)

CORS(
    app,
    origins=["http://localhost:5173"]
)


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing from .env"
    )


# =========================================================
# GEMINI
# =========================================================

print("Connecting to Gemini...")

client = genai.Client(
    api_key=API_KEY
)

MODEL = "gemini-3.5-flash-lite"
FALLBACK_MODEL = "gemini-3.6-flash"

print("Gemini connected successfully!")


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return render_template("index.html")


# =========================================================
# HELPER FUNCTION
# CLEAN GEMINI JSON RESPONSE
# =========================================================

def parse_gemini_response(response_text):

    """
    Converts Gemini's response into a Python dictionary.

    Handles:
    - Normal JSON
    - JSON inside ```json ... ```
    - JSON with extra text around it
    - Empty responses
    """

    if not response_text:
        raise ValueError(
            "Gemini returned an empty response."
        )


    # Convert to string and remove unnecessary whitespace
    text = str(response_text).strip()


    print("\n---------------- GEMINI RAW RESPONSE ----------------")
    print(text)
    print("-------------------------------------------------------\n")


    # -----------------------------------------------------
    # REMOVE MARKDOWN CODE BLOCKS
    # -----------------------------------------------------

    text = re.sub(
        r"^```json\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"^```\s*",
        "",
        text
    )

    text = re.sub(
        r"\s*```$",
        "",
        text
    )

    text = text.strip()


    # -----------------------------------------------------
    # TRY NORMAL JSON FIRST
    # -----------------------------------------------------

    try:

        result = json.loads(text)

        if isinstance(result, dict):
            return result

    except json.JSONDecodeError:
        pass


    # -----------------------------------------------------
    # FIND JSON OBJECT INSIDE RESPONSE
    # -----------------------------------------------------

    start = text.find("{")
    end = text.rfind("}")


    if start != -1 and end != -1 and end > start:

        json_text = text[start:end + 1]

        try:

            result = json.loads(json_text)

            if isinstance(result, dict):
                return result

        except json.JSONDecodeError as error:

            raise ValueError(
                "Gemini returned invalid JSON: "
                + str(error)
            )


    # -----------------------------------------------------
    # NOTHING VALID FOUND
    # -----------------------------------------------------

    raise ValueError(
        "Could not find valid JSON in Gemini response."
    )

#========================================================
# GEMINI GENERATION WITH FALLBACK
#========================================================

def generate_with_fallback(contents, config):
    """
    Try the primary Gemini model first.
    If Gemini returns a temporary 503/5xx error,
    retry with exponential backoff and then use
    the fallback model.
    """

    models_to_try = [
        MODEL,
        FALLBACK_MODEL
    ]

    last_error = None

    for model_index, model_name in enumerate(models_to_try):

        max_attempts = 3

        for attempt in range(max_attempts):

            try:
                print(
                    f"Gemini request: "
                    f"model={model_name}, "
                    f"attempt={attempt + 1}/{max_attempts}"
                )

                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config
                )

                print(
                    f"Gemini success using {model_name}"
                )

                return response

            except Exception as e:

                last_error = e

                error_text = str(e).lower()

                is_temporary_error = (
                    "503" in error_text
                    or "unavailable" in error_text
                    or "500" in error_text
                    or "502" in error_text
                    or "504" in error_text
                )

                if not is_temporary_error:
                    raise

                print(
                    f"Temporary Gemini error from "
                    f"{model_name}: {e}"
                )

                if attempt < max_attempts - 1:

                    delay = 2 ** attempt

                    print(
                        f"Retrying in {delay} seconds..."
                    )

                    time.sleep(delay)

        # Primary model failed after retries
        if model_index == 0:

            print(
                f"{MODEL} unavailable. "
                f"Switching to fallback model "
                f"{FALLBACK_MODEL}."
            )

    raise last_error

# =========================================================
# PROCESS AUDIO
# =========================================================

@app.route("/process", methods=["POST"])
def process_audio():

    start_time = time.time()

    filepath = None
    uploaded_file = None

    try:

        print("\n======================================")
        print("       VOXAAI PROCESSING AUDIO")
        print("======================================")


        # =================================================
        # CHECK AUDIO
        # =================================================

        if "audio" not in request.files:

            return jsonify({
                "success": False,
                "error": "No audio file received."
            }), 400


        audio = request.files["audio"]


        if audio.filename == "":

            return jsonify({
                "success": False,
                "error": "No audio file selected."
            }), 400


        # =================================================
        # SAVE AUDIO
        # =================================================

        os.makedirs(
            "uploads",
            exist_ok=True
        )


        extension = os.path.splitext(
            audio.filename
        )[1].lower()


        if not extension:

            extension = ".wav"


        # Use unique filename
        filename = (
            "voxaai_"
            + str(int(time.time() * 1000))
            + extension
        )


        filepath = os.path.join(
            "uploads",
            filename
        )


        audio.save(filepath)


        print(
            "Audio saved:",
            filepath
        )


        # =================================================
        # READ AUDIO FOR INLINE GEMINI PROCESSING
        # =================================================

        with open(filepath, "rb") as audio_file:

            audio_bytes = audio_file.read()

        print(
            "Audio loaded for inline Gemini processing."
        )


        # =================================================
        # VOXAAI TRANSLATION PROMPT
        # =================================================

        prompt = """
You are VoxaAI, an advanced multilingual speech translator
with visual command understanding.

Listen carefully to the uploaded audio.

The speaker may be speaking ANY human language.

Your tasks are:

1. Identify the language being spoken.
2. Understand the complete meaning of the speech.
3. Translate the speech accurately into natural English.
4. Determine whether the user is giving a visual/drawing command.
5. If the user is asking to draw, create, sketch, illustrate,
   visualize, or represent something visually, generate a
   clear visual description that can be rendered as a drawing.
6. If the speech is NOT a visual/drawing command, set
   "is_visual_command" to false.

IMPORTANT:

Return ONLY a valid JSON object.

The JSON MUST contain exactly these fields:

{
    "language": "detected language name",
    "translation": "English translation",
    "is_visual_command": true,
    "visual_description": "clear description of what should be drawn",
    "drawing_svg": "SVG drawing code",
    "bpmn_xml": "valid BPMN 2.0 XML"
}

Rules:

- Use the full language name.
- Examples: Kannada, Hindi, Tamil, Telugu,
  Malayalam, English, Marathi, Bengali, etc.
- Do not use language codes.

Translation rules:

- Translate the complete meaning into natural English.
- Do NOT summarize.
- Preserve names, numbers, places and important details.

Visual command rules:

- Set "is_visual_command" to true ONLY when the user
  explicitly asks for something to be drawn, sketched,
  illustrated, created visually, or represented as an image.
- If it is not a visual command, set it to false.
- When false, set "visual_description" to an empty string.
- When true, describe exactly what should be drawn.
- Include important objects, colors, positions, quantities,
  shapes and relationships mentioned by the speaker.
- Do not invent unnecessary objects.

SVG DRAWING RULES:

When "is_visual_command" is true:

- Generate a simple, compact SVG illustration.
- The SVG must have a viewBox of "0 0 800 500".
- Use only essential SVG elements:
  rect, circle, ellipse, line, polygon, polyline and path.
- Keep the SVG as short as possible while remaining visually clear.
- Do NOT use <defs>.
- Do NOT use filters.
- Do NOT use shadows.
- Do NOT use gradients.
- Do NOT use <marker>.
- Do NOT use JavaScript.
- Do NOT use HTML.
- Do NOT use external images.
- Do NOT use external URLs.
- Use simple lines instead of complex arrow markers.
- Use simple colors.
- Preserve the objects and relationships requested by the user.
- Do not add unnecessary decorative elements.
- Return only valid SVG markup.
- The SVG must begin with <svg and end with </svg>.

BPMN GENERATION RULES:

When the user's request describes a process, workflow, flowchart,
business process, approval process, decision process, or explicitly
asks for a BPMN diagram, generate a complete BPMN 2.0 XML document.

The BPMN XML MUST:

1. Be a complete, well-formed XML document.

2. Start with:
<?xml version="1.0" encoding="UTF-8"?>

3. Use these exact namespace declarations:

xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
xmlns:di="http://www.omg.org/spec/DD/20100524/DI"

4. Use the bpmn namespace prefix correctly for EVERY BPMN element.

Examples of valid elements:

<bpmn:definitions>
<bpmn:process>
<bpmn:startEvent>
<bpmn:endEvent>
<bpmn:task>
<bpmn:exclusiveGateway>
<bpmn:parallelGateway>
<bpmn:sequenceFlow>
<bpmn:incoming>
<bpmn:outgoing>

NEVER generate malformed names such as:

<bpmndefinitions>
<bpmnprocess>
<bpmntask>
<bpmnoutgoing>
<bpmnincoming>

Always include the colon after "bpmn".

5. Every opening XML tag MUST have a matching closing tag
or be a valid self-closing tag.

6. Do not use undefined XML prefixes.

7. All element IDs must be unique.

8. Every sequenceFlow must contain valid:
sourceRef
targetRef

9. Include BPMN DI information:

<bpmndi:BPMNDiagram>
<bpmndi:BPMNPlane>
<bpmndi:BPMNShape>
<bpmndi:BPMNEdge>

with:

<dc:Bounds>
<di:waypoint>

10. Every BPMNShape must reference an existing BPMN element
through bpmnElement.

11. Every BPMNEdge must reference an existing sequenceFlow
through bpmnElement.

12. Use sensible left-to-right coordinates.

13. Ensure all sequence flows connect existing elements.

14. Ensure the process has a logical start and end where appropriate.

15. For decisions, use bpmn:exclusiveGateway.

16. For parallel activities, use bpmn:parallelGateway.

17. Keep the BPMN XML concise enough to avoid truncation.

18. The entire BPMN XML must be complete.

19. The XML MUST end with:

</bpmn:definitions>

20. Do not truncate the XML.

21. Do not include Markdown code fences around the BPMN XML.

22. Do not include explanations inside bpmn_xml.

23. Return the complete BPMN XML as a string in the bpmn_xml field.

IMPORTANT:
Before returning the response, internally verify that the BPMN XML is
well-formed XML and that all namespace prefixes and tags are valid.

For BPMN diagrams, prefer the minimum necessary BPMN elements required
to represent the user's requested process. Do not add unnecessary
incoming/outgoing elements if they are not required for the model.

When "is_visual_command" is false:

- Set "visual_description" to an empty string.
- Set "drawing_svg" to an empty string.
- Set "bpmn_xml" to an empty string.

Examples:

User:
"Draw a house"

Return:
{
    "language": "English",
    "translation": "Draw a house",
    "is_visual_command": true,
    "visual_description": "A simple house with a roof, walls, door and windows."
}

User:
"Draw a red car beside a tree"

Return:
{
    "language": "English",
    "translation": "Draw a red car beside a tree",
    "is_visual_command": true,
    "visual_description": "A red car positioned beside a green tree."
}

User:
"What is the weather today?"

Return:
{
    "language": "English",
    "translation": "What is the weather today?",
    "is_visual_command": false,
    "visual_description": ""
}

Do not add markdown.

Do not use ```json.

Do not add explanations.

Do not add text before or after the JSON.
"""


        # =================================================
        # SEND AUDIO TO GEMINI
        # =================================================

        print(
            "Sending audio to Gemini..."
        )

        generation_start = time.time()


        contents = [
            prompt,
            types.Part.from_bytes(
                data=audio_bytes,
                mime_type="audio/webm"
            )
        ]

        config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(
                thinking_level="minimal"
            ),
            max_output_tokens=8000,
            response_mime_type="application/json",
            response_schema=VoxaAIResponse
        )

        response = generate_with_fallback(
            contents,
            config
        )

        generation_time = time.time() - generation_start

        print(
            "Gemini Generation Time:",
            round(generation_time, 2),
            "seconds"
        )


        # =================================================
        # GET GEMINI STRUCTURED RESPONSE
        # =================================================

        print(
            "\nGemini response received."
        )


        # =================================================
        # USE PYDANTIC PARSED RESPONSE
        # =================================================

        if response.parsed is not None:

            result = response.parsed.model_dump()

        else:

            # Fallback for unexpected responses
            response_text = response.text

            result = parse_gemini_response(
                response_text
            )


        # =================================================
        # GET LANGUAGE
        # =================================================

        detected_language = result.get(
            "language"
        )


        # =================================================
        # GET TRANSLATION
        # =================================================

        english_translation = result.get(
            "translation"
        )

        # =================================================
        # GET VISUAL COMMAND
        # =================================================

        is_visual_command = result.get(
            "is_visual_command",
            False
        )

        visual_description = result.get(
            "visual_description",
            ""
        )

        drawing_svg = result.get(
            "drawing_svg",
            ""
        )

        bpmn_xml = result.get(
            "bpmn_xml",
            ""
        )

        # =================================================
        # VALIDATE RESULT
        # =================================================

        if not detected_language:

            detected_language = "Unknown"


        if not english_translation:

            raise ValueError(
                "Gemini did not return an English translation."
            )


        # =================================================
        # CLEAN VALUES
        # =================================================

        detected_language = str(
            detected_language
        ).strip()


        english_translation = str(
            english_translation
        ).strip()


        # =================================================
        # PROCESSING TIME
        # =================================================

        processing_time = (
            time.time() - start_time
        )


        # =================================================
        # LOG RESULTS
        # =================================================

        print("\n======================================")
        print(
            "Detected Language:",
            detected_language
        )

        print(
            "Translation:",
            english_translation
        )

        print(
            "Processing Time:",
            round(
                processing_time,
                2
            ),
            "seconds"
        )

        print("======================================\n")


        # =================================================
        # DELETE LOCAL AUDIO
        # =================================================

        if (
            filepath
            and os.path.exists(filepath)
        ):

            try:

                os.remove(filepath)

                print(
                    "Local audio deleted."
                )

            except OSError as cleanup_error:

                print(
                    "Could not delete local audio:",
                    cleanup_error
                )


        filepath = None


        # =================================================
        # RETURN RESULT TO REACT
        # =================================================

        return jsonify({

            "success": True,

            "language":
                detected_language,

            "translation":
                english_translation,

            "is_visual_command":
                bool(is_visual_command),

            "visual_description":
                str(visual_description).strip(),

            "drawing_svg":
                str(drawing_svg).strip(),

            "bpmn_xml":
                str(bpmn_xml).strip(),

            "processing_time":
                round(
                    processing_time,
                    2
                )

        }), 200


    # =====================================================
    # ERROR HANDLING
    # =====================================================

    except Exception as error:

        print("\n======================================")
        print("           VOXAAI ERROR")
        print("======================================")
        print(
            type(error).__name__,
            ":",
            str(error)
        )
        print("======================================\n")


        # =================================================
        # CLEANUP AUDIO
        # =================================================

        if (
            filepath
            and os.path.exists(filepath)
        ):

            try:

                os.remove(filepath)

            except OSError:

                pass


        # =================================================
        # RETURN ERROR TO FRONTEND
        # =================================================

        return jsonify({

            "success": False,

            "error":
                str(error)

        }), 500

# =========================================================
# AI BPMN WORKFLOW ANALYSIS
# =========================================================

@app.route("/analyze-bpmn", methods=["POST"])
def analyze_bpmn():
    try:
        data = request.get_json()

        if not data or not data.get("bpmn_xml"):
            return jsonify({
                "success": False,
                "error": "BPMN XML is required."
            }), 400

        bpmn_xml = data["bpmn_xml"]

        prompt = f"""
Analyze the following BPMN 2.0 workflow.

Provide a professional workflow analysis.

Return ONLY the structured response requested by the schema.

Focus on:

1. Process summary
2. Strengths of the workflow
3. Issues or potential problems
4. Automation opportunities
5. Practical recommendations

Do not modify the BPMN.
Do not generate BPMN XML.

BPMN XML:

{bpmn_xml}
"""

        models = [
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash"
        ]

        response = None

        for model in models:
            for attempt in range(3):
                try:
                    print(
                        f"AI BPMN analysis request: "
                        f"model={model}, attempt={attempt + 1}/3"
                    )

                    response = client.models.generate_content(
                        model=model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            thinking_config=types.ThinkingConfig(
                                thinking_level="minimal"
                            ),
                            max_output_tokens=2500,
                            response_mime_type="application/json",
                            response_schema=BPMNAnalysisResponse
                        )
                    )

                    print(
                        f"AI BPMN analysis succeeded using {model}"
                    )

                    break

                except Exception as model_error:
                    print(
                        f"Temporary Gemini error from {model}: "
                        f"{model_error}"
                    )

                    if attempt < 2:
                        wait_time = attempt + 1
                        print(
                            f"Retrying in {wait_time} seconds..."
                        )
                        time.sleep(wait_time)

            if response is not None:
                break

            print(
                f"{model} unavailable. "
                f"Switching to fallback model..."
            )

        if response is None:
            return jsonify({
                "success": False,
                "error": (
                    "Gemini AI service is temporarily unavailable. "
                    "Please try again later."
                )
            }), 503

        try:
            if hasattr(response, "parsed") and response.parsed:
                result = response.parsed.model_dump()
            else:
                result = json.loads(response.text)

        except Exception as parse_error:
            print(
                "BPMN analysis parsing error:",
                parse_error
            )

            return jsonify({
                "success": False,
                "error": "Could not parse the AI analysis response."
            }), 500

        return jsonify({
            "success": True,
            **result
        })

    except Exception as error:
        print("BPMN analysis error:", error)

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500

#========================================================
# AI BPMN WORKFLOW DOCUMENTATION
#========================================================

@app.route("/document-bpmn", methods=["POST"])
def document_bpmn():
    try:
        data = request.get_json()

        if not data or not data.get("bpmn_xml"):
            return jsonify({
                "success": False,
                "error": "BPMN XML is required."
            }), 400

        bpmn_xml = data["bpmn_xml"]

        prompt = f"""
Generate professional business-process documentation
from the following BPMN 2.0 workflow.

Return ONLY the structured response requested by the schema.

Generate:

1. Process overview
2. Workflow steps
3. Business rules
4. Key decisions
5. Roles and responsibilities

Do not modify the BPMN.
Do not generate BPMN XML.

BPMN XML:

{bpmn_xml}
"""

        models = [
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash"
        ]

        response = None

        for model in models:
            for attempt in range(3):
                try:
                    print(
                        f"AI BPMN documentation request: "
                        f"model={model}, attempt={attempt + 1}/3"
                    )

                    response = client.models.generate_content(
                        model=model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            thinking_config=types.ThinkingConfig(
                                thinking_level="minimal"
                            ),
                            max_output_tokens=2500,
                            response_mime_type="application/json",
                            response_schema=BPMNDocumentationResponse
                        )
                    )

                    print(
                        f"AI BPMN documentation succeeded "
                        f"using {model}"
                    )

                    break

                except Exception as model_error:
                    print(
                        f"Temporary Gemini error from {model}: "
                        f"{model_error}"
                    )

                    if attempt < 2:
                        wait_time = attempt + 1
                        print(
                            f"Retrying in {wait_time} seconds..."
                        )
                        time.sleep(wait_time)

            if response is not None:
                break

            print(
                f"{model} unavailable. "
                f"Switching to fallback model..."
            )

        if response is None:
            return jsonify({
                "success": False,
                "error": (
                    "Gemini AI service is temporarily unavailable. "
                    "Please try again later."
                )
            }), 503

        try:
            if hasattr(response, "parsed") and response.parsed:
                result = response.parsed.model_dump()
            else:
                result = json.loads(response.text)

        except Exception as parse_error:
            print(
                "BPMN documentation parsing error:",
                parse_error
            )

            return jsonify({
                "success": False,
                "error": (
                    "Could not parse the AI documentation response."
                )
            }), 500

        return jsonify({
            "success": True,
            **result
        })

    except Exception as error:
        print("BPMN documentation error:", error)

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500

    
# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({

        "success": True,

        "message":
            "VoxaAI backend is running.",

        "model":
            MODEL

    })


# =========================================================
# START VOXAAI
# =========================================================

if __name__ == "__main__":

    print("\n======================================")
    print("              VOXAAI")
    print("   Real-Time Speech Translator")
    print("======================================")
    print(
        "Gemini Model:",
        MODEL
    )
    print(
        "Backend:",
        "http://127.0.0.1:5000"
    )
    print(
        "Frontend:",
        "http://localhost:5173"
    )
    print("======================================\n")


    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True

    )