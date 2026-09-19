from transformers import AutoTokenizer, AutoModelForSeq2SeqLM


# =========================================================
# VOXAAI TRANSLATION MODEL
# =========================================================

MODEL_NAME = "facebook/nllb-200-distilled-600M"

print("Loading translation model...")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME,
    local_files_only=True
)

model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME,
    local_files_only=True
)

print("Translation model loaded successfully!")


# =========================================================
# TRANSLATE TO ENGLISH
# =========================================================

def translate_to_english(text, source_language):

    if not text:
        return ""

    # -----------------------------------------------------
    # ENGLISH → ENGLISH
    # -----------------------------------------------------

    if source_language == "en":
        return text


    # -----------------------------------------------------
    # KANNADA → ENGLISH
    # -----------------------------------------------------

    if source_language == "kn":

        tokenizer.src_lang = "kan_Knda"

        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=128
        )

        translated_tokens = model.generate(

            **inputs,

            forced_bos_token_id=
                tokenizer.convert_tokens_to_ids(
                    "eng_Latn"
                ),

            max_new_tokens=64,

            num_beams=2,

            repetition_penalty=1.2,

            no_repeat_ngram_size=3
        )

        translation = tokenizer.batch_decode(
            translated_tokens,
            skip_special_tokens=True
        )[0]

        return translation.strip()


    # -----------------------------------------------------
    # OTHER LANGUAGES
    # -----------------------------------------------------

    return text