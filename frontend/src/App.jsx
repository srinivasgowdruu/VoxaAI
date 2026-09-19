import React, { useEffect, useRef, useState } from "react";
import pptxGen from "pptxgenjs";
import "./App.css";
import BpmnEditor from "./BpmnEditor";


function MicrophoneIcon({ size = 48 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="22"
        y="7"
        width="20"
        height="34"
        rx="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="M14 29V32C14 42.4934 22.0589 51 32 51C41.9411 51 50 42.4934 50 32V29"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 51V58"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M24 58H40"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 16V4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 9L12 4L17 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16 8V6C16 4.89543 15.1046 4 14 4H6C4.89543 4 4 4.89543 4 6V14C4 15.1046 4.89543 16 6 16H8"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 11L12 16L17 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 7H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 11V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 11V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 7L7 20H17L18 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 7V4H15V7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 12H5L7 7L10 17L13 5L16 19L19 9L21 12H23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3 12H21"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 3C9.5 5.5 8.5 8.5 8.5 12C8.5 15.5 9.5 18.5 12 21"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function App() {
  
  const [activeTab, setActiveTab] = useState("translator");

  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);

  const [detectedLanguage, setDetectedLanguage] =
    useState("Unknown");

  const [translation, setTranslation] = useState("");

  const [isVisualCommand, setIsVisualCommand] =
    useState(false);

  const [visualDescription, setVisualDescription] =
    useState("");

  const [drawingSVG, setDrawingSVG] = useState("");

  const [bpmnXml, setBpmnXml] = useState("");

  const [processingTime, setProcessingTime] =
    useState(null);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const drawingContainerRef = useRef(null);

  // =====================================================
  // PROCESS AUDIO
  // =====================================================

  const processAudio = async (file) => {
    if (!file) return;

    setIsProcessing(true);
    setError("");
    setTranslation("");
    setDetectedLanguage("Detecting...");
    setProcessingTime(null);
    setCopied(false);

    const formData = new FormData();

    formData.append("audio", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/process",
        {
          method: "POST",
          body: formData,
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Could not process the audio."
        );
      }

      setDetectedLanguage(
        data.language || "Unknown"
      );

      setTranslation(
        data.translation || ""
      );

      setIsVisualCommand(
        Boolean(data.is_visual_command)
      );

      setVisualDescription(
        data.visual_description || ""
      );

      setDrawingSVG(
        data.drawing_svg || ""
      );

      setBpmnXml(
        data.bpmn_xml || ""
      );

      setProcessingTime(
        data.processing_time
          ? Number(data.processing_time).toFixed(2)
          : null
      );
    } catch (err) {
      console.error(err);

      setDetectedLanguage("Error");

      setError(
        err.message ||
          "Could not process the audio."
      );

      setTranslation(
        "Could not process the audio."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // =====================================================
  // SVG EDITOR
  // =====================================================

  useEffect(() => {
    if (!isEditMode || !drawingSVG) return;

    const container =
      drawingContainerRef.current;

    if (!container) return;

    const svg =
      container.querySelector("svg");

    if (!svg) return;

    // -----------------------------------------------------
    // EDITOR STATE
    // -----------------------------------------------------

    let selectedElement = null;

    let interaction = null;

    let startX = 0;
    let startY = 0;

    let originalMatrix = null;
    let originalScreenMatrix = null;

    let originalBBox = null;

    let originalLine = null;
    let originalArrowHead = null;

    // -----------------------------------------------------
    // MATRIX HELPERS
    // -----------------------------------------------------

    const identityMatrix = () => {
      return new DOMMatrix();
    };

    const matrixToString = (matrix) => {
      return `matrix(
        ${matrix.a}
        ${matrix.b}
        ${matrix.c}
        ${matrix.d}
        ${matrix.e}
        ${matrix.f}
      )`;
    };

    const translationMatrix = (dx, dy) => {
      return new DOMMatrix()
        .translate(dx, dy);
    };

    const scaleAroundPoint = (
      sx,
      sy,
      x,
      y
    ) => {
      return new DOMMatrix()
        .translate(x, y)
        .scale(sx, sy)
        .translate(-x, -y);
    };

    const rotationAroundPoint = (
      angle,
      x,
      y
    ) => {
      return new DOMMatrix()
        .translate(x, y)
        .rotate(angle)
        .translate(-x, -y);
    };

    // -----------------------------------------------------
    // SVG MOUSE POSITION
    // -----------------------------------------------------

    const getMousePosition = (event) => {
      const screenMatrix =
        svg.getScreenCTM();

      if (!screenMatrix) {
        return {
          x: event.clientX,
          y: event.clientY,
        };
      }

      const inverse =
        screenMatrix.inverse();

      const point =
        new DOMPoint(
          event.clientX,
          event.clientY
        ).matrixTransform(inverse);

      return {
        x: point.x,
        y: point.y,
      };
    };

    // -----------------------------------------------------
    // CONVERT LOCAL POINT TO SVG POINT
    // -----------------------------------------------------

    const localToSVG = (
      element,
      x,
      y
    ) => {
      const elementMatrix =
        element.getScreenCTM();

      const svgMatrix =
        svg.getScreenCTM();

      if (
        !elementMatrix ||
        !svgMatrix
      ) {
        return {
          x,
          y,
        };
      }

      const screenPoint =
        new DOMPoint(
          x,
          y
        ).matrixTransform(
          elementMatrix
        );

      const svgPoint =
        screenPoint.matrixTransform(
          svgMatrix.inverse()
        );

      return {
        x: svgPoint.x,
        y: svgPoint.y,
      };
    };

    // -----------------------------------------------------
    // CONVERT SVG POINT TO LOCAL POINT
    // -----------------------------------------------------

    const svgToLocal = (
      element,
      x,
      y,
      screenMatrixOverride = null
    ) => {
      const svgMatrix =
        svg.getScreenCTM();

      const elementMatrix =
        screenMatrixOverride ||
        element.getScreenCTM();

      if (
        !svgMatrix ||
        !elementMatrix
      ) {
        return {
          x,
          y,
        };
      }

      const screenPoint =
        new DOMPoint(
          x,
          y
        ).matrixTransform(
          svgMatrix
        );

      const localPoint =
        screenPoint.matrixTransform(
          elementMatrix.inverse()
        );

      return {
        x: localPoint.x,
        y: localPoint.y,
      };
    };

    // -----------------------------------------------------
    // GET LOCAL TRANSFORM MATRIX
    // -----------------------------------------------------

    const getLocalMatrix = (
      element
    ) => {
      try {
        const consolidated =
          element.transform.baseVal.consolidate();

        if (
          consolidated &&
          consolidated.matrix
        ) {
          return new DOMMatrix(
            matrixToString(
              consolidated.matrix
            )
          );
        }
      } catch (error) {
        console.warn(
          "Could not read SVG transform:",
          error
        );
      }

      return identityMatrix();
    };

    // -----------------------------------------------------
    // SET LOCAL TRANSFORM MATRIX
    // -----------------------------------------------------

    const setLocalMatrix = (
      element,
      matrix
    ) => {
      element.setAttribute(
        "transform",
        matrixToString(matrix)
      );
    };

    // -----------------------------------------------------
    // CREATE EDITOR LAYER
    // -----------------------------------------------------

    const editorLayer =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );

    editorLayer.setAttribute(
      "data-editor-ui",
      "true"
    );

    svg.appendChild(
      editorLayer
    );

    // -----------------------------------------------------
    // CREATE SVG ELEMENT
    // -----------------------------------------------------

    const createSVGElement = (
      tag,
      attributes
    ) => {
      const element =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          tag
        );

      Object.entries(
        attributes
      ).forEach(
        ([key, value]) => {
          element.setAttribute(
            key,
            value
          );
        }
      );

      return element;
    };

    // -----------------------------------------------------
    // FIND ARROWHEAD
    // -----------------------------------------------------

    const findArrowHead = (
      line
    ) => {
      const x2 =
        parseFloat(
          line.getAttribute("x2")
        );

      const y2 =
        parseFloat(
          line.getAttribute("y2")
        );

      const polygons =
        svg.querySelectorAll(
          "polygon"
        );

      let closest = null;

      let smallestDistance =
        Infinity;

      polygons.forEach(
        (polygon) => {
          if (
            polygon.hasAttribute(
              "data-editor-ui"
            )
          ) {
            return;
          }

          const points =
            polygon.getAttribute(
              "points"
            );

          if (!points) return;

          const coordinates =
            points
              .trim()
              .split(/\s+/)
              .map((point) => {
                const parts =
                  point
                    .split(",")
                    .map(Number);

                return {
                  x: parts[0],
                  y: parts[1],
                };
              });

          if (!coordinates.length)
            return;

          const center =
            coordinates.reduce(
              (sum, point) => ({
                x:
                  sum.x +
                  point.x,

                y:
                  sum.y +
                  point.y,
              }),
              {
                x: 0,
                y: 0,
              }
            );

          center.x /=
            coordinates.length;

          center.y /=
            coordinates.length;

          const distance =
            Math.sqrt(
              Math.pow(
                center.x - x2,
                2
              ) +
              Math.pow(
                center.y - y2,
                2
              )
            );

          if (
            distance <
              smallestDistance &&
            distance < 35
          ) {
            smallestDistance =
              distance;

            closest =
              polygon;
          }
        }
      );

      return closest;
    };

    // -----------------------------------------------------
    // UPDATE ARROWHEAD
    // -----------------------------------------------------

    const updateArrowHead = (
      line,
      arrowHead
    ) => {
      if (!arrowHead) return;

      const x1 =
        parseFloat(
          line.getAttribute("x1")
        );

      const y1 =
        parseFloat(
          line.getAttribute("y1")
        );

      const x2 =
        parseFloat(
          line.getAttribute("x2")
        );

      const y2 =
        parseFloat(
          line.getAttribute("y2")
        );

      const dx =
        x2 - x1;

      const dy =
        y2 - y1;

      const length =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      if (!length) return;

      const unitX =
        dx / length;

      const unitY =
        dy / length;

      const perpendicularX =
        -unitY;

      const perpendicularY =
        unitX;

      const arrowLength = 14;
      const arrowWidth = 7;

      const baseX =
        x2 -
        unitX *
          arrowLength;

      const baseY =
        y2 -
        unitY *
          arrowLength;

      const leftX =
        baseX +
        perpendicularX *
          arrowWidth;

      const leftY =
        baseY +
        perpendicularY *
          arrowWidth;

      const rightX =
        baseX -
        perpendicularX *
          arrowWidth;

      const rightY =
        baseY -
        perpendicularY *
          arrowWidth;

      arrowHead.setAttribute(
        "points",
        `${x2},${y2} ${leftX},${leftY} ${rightX},${rightY}`
      );
    };

    // -----------------------------------------------------
    // GET VISUAL CORNERS
    // -----------------------------------------------------

    const getVisualCorners = (
      element
    ) => {
      const bbox =
        element.getBBox();

      const points = {
        nw: localToSVG(
          element,
          bbox.x,
          bbox.y
        ),

        ne: localToSVG(
          element,
          bbox.x +
            bbox.width,
          bbox.y
        ),

        sw: localToSVG(
          element,
          bbox.x,
          bbox.y +
            bbox.height
        ),

        se: localToSVG(
          element,
          bbox.x +
            bbox.width,
          bbox.y +
            bbox.height
        ),

        center: localToSVG(
          element,
          bbox.x +
            bbox.width / 2,
          bbox.y +
            bbox.height / 2
        ),
      };

      return points;
    };

    // -----------------------------------------------------
    // DRAW EDITOR UI
    // -----------------------------------------------------

    const updateEditorUI = () => {
      editorLayer.innerHTML = "";

      if (!selectedElement)
        return;

      if (
        selectedElement ===
        editorLayer
      ) {
        return;
      }

      // ---------------------------------------------------
      // LINE / ARROW
      // ---------------------------------------------------

      if (
        selectedElement.tagName ===
        "line"
      ) {
        const x1 =
          parseFloat(
            selectedElement.getAttribute(
              "x1"
            )
          );

        const y1 =
          parseFloat(
            selectedElement.getAttribute(
              "y1"
            )
          );

        const x2 =
          parseFloat(
            selectedElement.getAttribute(
              "x2"
            )
          );

        const y2 =
          parseFloat(
            selectedElement.getAttribute(
              "y2"
            )
          );

        const selectionLine =
          createSVGElement(
            "line",
            {
              x1,
              y1,
              x2,
              y2,
              stroke: "#2563eb",
              "stroke-width": "2",
              "stroke-dasharray":
                "6 4",
              "pointer-events":
                "none",
            }
          );

        editorLayer.appendChild(
          selectionLine
        );

        const startHandle =
          createSVGElement(
            "circle",
            {
              cx: x1,
              cy: y1,
              r: 7,
              fill: "#ffffff",
              stroke: "#2563eb",
              "stroke-width": 3,
              cursor: "crosshair",
              "data-editor-ui":
                "true",
              "data-handle":
                "arrow-start",
            }
          );

        editorLayer.appendChild(
          startHandle
        );

        const endHandle =
          createSVGElement(
            "circle",
            {
              cx: x2,
              cy: y2,
              r: 7,
              fill: "#ffffff",
              stroke: "#2563eb",
              "stroke-width": 3,
              cursor: "crosshair",
              "data-editor-ui":
                "true",
              "data-handle":
                "arrow-end",
            }
          );

        editorLayer.appendChild(
          endHandle
        );

        return;
      }

      // ---------------------------------------------------
      // NORMAL SHAPE
      // ---------------------------------------------------

      const bbox =
        selectedElement.getBBox();

      const corners =
        getVisualCorners(
          selectedElement
        );

      // ---------------------------------------------------
      // SELECTION BOX
      // ---------------------------------------------------

      const selection =
        createSVGElement(
          "polygon",
          {
            points: `
              ${corners.nw.x},${corners.nw.y}
              ${corners.ne.x},${corners.ne.y}
              ${corners.se.x},${corners.se.y}
              ${corners.sw.x},${corners.sw.y}
            `,
            fill: "none",
            stroke: "#2563eb",
            "stroke-width": "2",
            "stroke-dasharray":
              "6 4",
            "pointer-events":
              "none",
          }
        );

      editorLayer.appendChild(
        selection
      );

      // ---------------------------------------------------
      // RESIZE HANDLES
      // ---------------------------------------------------

      const handles = [
        {
          name: "nw",
          point: corners.nw,
          cursor:
            "nwse-resize",
        },

        {
          name: "ne",
          point: corners.ne,
          cursor:
            "nesw-resize",
        },

        {
          name: "sw",
          point: corners.sw,
          cursor:
            "nesw-resize",
        },

        {
          name: "se",
          point: corners.se,
          cursor:
            "nwse-resize",
        },
      ];

      handles.forEach(
        (handle) => {
          const circle =
            createSVGElement(
              "circle",
              {
                cx:
                  handle.point.x,

                cy:
                  handle.point.y,

                r: 7,

                fill: "#ffffff",

                stroke:
                  "#2563eb",

                "stroke-width": 3,

                cursor:
                  handle.cursor,

                "data-editor-ui":
                  "true",

                "data-handle":
                  handle.name,
              }
            );

          editorLayer.appendChild(
            circle
          );
        }
      );

      // ---------------------------------------------------
      // ROTATION HANDLE
      // ---------------------------------------------------

      const center =
        corners.center;

      const topMiddle = {
        x:
          (corners.nw.x +
            corners.ne.x) /
          2,

        y:
          (corners.nw.y +
            corners.ne.y) /
          2,
      };

      const dx =
        topMiddle.x -
        center.x;

      const dy =
        topMiddle.y -
        center.y;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      const normalizedX =
        distance
          ? dx / distance
          : 0;

      const normalizedY =
        distance
          ? dy / distance
          : -1;

      const rotationHandle =
        {
          x:
            topMiddle.x +
            normalizedX *
              35,

          y:
            topMiddle.y +
            normalizedY *
              35,
        };

      const rotationLine =
        createSVGElement(
          "line",
          {
            x1:
              topMiddle.x,

            y1:
              topMiddle.y,

            x2:
              rotationHandle.x,

            y2:
              rotationHandle.y,

            stroke:
              "#2563eb",

            "stroke-width":
              "2",

            "pointer-events":
              "none",
          }
        );

      editorLayer.appendChild(
        rotationLine
      );

      const rotationCircle =
        createSVGElement(
          "circle",
          {
            cx:
              rotationHandle.x,

            cy:
              rotationHandle.y,

            r: 7,

            fill:
              "#2563eb",

            stroke:
              "#ffffff",

            "stroke-width":
              "2",

            cursor:
              "grab",

            "data-editor-ui":
              "true",

            "data-handle":
              "rotate",
          }
        );

      editorLayer.appendChild(
        rotationCircle
      );
    };

    // -----------------------------------------------------
    // SELECT ELEMENT
    // -----------------------------------------------------

    const selectElement = (
      element
    ) => {
      if (
        !element ||
        element === editorLayer
      ) {
        return;
      }

      if (
        element.hasAttribute(
          "data-editor-ui"
        ) ||
        element.closest(
          "[data-editor-ui]"
        )
      ) {
        return;
      }

      if (
        element.tagName ===
          "defs" ||
        element.closest("defs")
      ) {
        return;
      }

      selectedElement =
        element;

      updateEditorUI();
    };

    // -----------------------------------------------------
    // MOVE NORMAL ELEMENT
    // -----------------------------------------------------

    const moveElement = (
      element,
      dx,
      dy
    ) => {
      if (!originalMatrix)
        return;

      const moveMatrix =
        translationMatrix(
          dx,
          dy
        );

      const newMatrix =
        moveMatrix.multiply(
          originalMatrix
        );

      setLocalMatrix(
        element,
        newMatrix
      );
    };

    // -----------------------------------------------------
    // MOVE ARROW
    // -----------------------------------------------------

    const moveArrow = (
      line,
      arrowHead,
      dx,
      dy
    ) => {
      const x1 =
        parseFloat(
          line.getAttribute("x1")
        );

      const y1 =
        parseFloat(
          line.getAttribute("y1")
        );

      const x2 =
        parseFloat(
          line.getAttribute("x2")
        );

      const y2 =
        parseFloat(
          line.getAttribute("y2")
        );

      line.setAttribute(
        "x1",
        x1 + dx
      );

      line.setAttribute(
        "y1",
        y1 + dy
      );

      line.setAttribute(
        "x2",
        x2 + dx
      );

      line.setAttribute(
        "y2",
        y2 + dy
      );

      if (arrowHead) {
        const points =
          arrowHead
            .getAttribute(
              "points"
            )
            ?.trim()
            .split(/\s+/);

        if (points) {
          const newPoints =
            points
              .map(
                (point) => {
                  const [
                    x,
                    y,
                  ] =
                    point
                      .split(",")
                      .map(
                        Number
                      );

                  return `${x + dx},${
                    y + dy
                  }`;
                }
              )
              .join(" ");

          arrowHead.setAttribute(
            "points",
            newPoints
          );
        }
      }
    };

    // -----------------------------------------------------
    // RESIZE ELEMENT
    // -----------------------------------------------------

    const resizeElement = (
      element,
      handle,
      mouseX,
      mouseY
    ) => {
      if (
        !originalBBox ||
        !originalMatrix ||
        !originalScreenMatrix
      ) {
        return;
      }

      // Convert mouse position into the
      // ORIGINAL local coordinate system.
      const localMouse =
        svgToLocal(
          element,
          mouseX,
          mouseY,
          originalScreenMatrix
        );

      const x =
        originalBBox.x;

      const y =
        originalBBox.y;

      const width =
        originalBBox.width;

      const height =
        originalBBox.height;

      let movingPoint;
      let anchorPoint;

      if (handle === "nw") {
        movingPoint = {
          x,
          y,
        };

        anchorPoint = {
          x:
            x + width,

          y:
            y + height,
        };
      }

      if (handle === "ne") {
        movingPoint = {
          x:
            x + width,

          y,
        };

        anchorPoint = {
          x,
          y:
            y + height,
        };
      }

      if (handle === "sw") {
        movingPoint = {
          x,

          y:
            y + height,
        };

        anchorPoint = {
          x:
            x + width,

          y,
        };
      }

      if (handle === "se") {
        movingPoint = {
          x:
            x + width,

          y:
            y + height,
        };

        anchorPoint = {
          x,
          y,
        };
      }

      if (
        !movingPoint ||
        !anchorPoint
      ) {
        return;
      }

      const originalWidth =
        movingPoint.x -
        anchorPoint.x;

      const originalHeight =
        movingPoint.y -
        anchorPoint.y;

      if (
        Math.abs(originalWidth) <
        0.0001 ||
        Math.abs(originalHeight) <
        0.0001
      ) {
        return;
      }

      let scaleX =
        (localMouse.x -
          anchorPoint.x) /
        originalWidth;

      let scaleY =
        (localMouse.y -
          anchorPoint.y) /
        originalHeight;

      // Prevent the object from collapsing
      // completely.
      if (
        Math.abs(scaleX) <
        0.05
      ) {
        scaleX =
          scaleX < 0
            ? -0.05
            : 0.05;
      }

      if (
        Math.abs(scaleY) <
        0.05
      ) {
        scaleY =
          scaleY < 0
            ? -0.05
            : 0.05;
      }

      const scaleMatrix =
        scaleAroundPoint(
          scaleX,
          scaleY,
          anchorPoint.x,
          anchorPoint.y
        );

      const newMatrix =
        originalMatrix.multiply(
          new DOMMatrix()
            .translate(
              anchorPoint.x,
              anchorPoint.y
            )
            .scale(
              scaleX,
              scaleY
            )
            .translate(
              -anchorPoint.x,
              -anchorPoint.y
            )
        );

      // Use the mathematically correct
      // local transform.
      setLocalMatrix(
        element,
        newMatrix
      );
    };

    // -----------------------------------------------------
    // ROTATE ELEMENT
    // -----------------------------------------------------

    const rotateElement = (
      element,
      mouseX,
      mouseY
    ) => {
      if (
        !originalBBox ||
        !originalMatrix ||
        !originalScreenMatrix
      ) {
        return;
      }

      const centerX =
        originalBBox.x +
        originalBBox.width /
          2;

      const centerY =
        originalBBox.y +
        originalBBox.height /
          2;

      const localMouse =
        svgToLocal(
          element,
          mouseX,
          mouseY,
          originalScreenMatrix
        );

      const startAngle =
        Math.atan2(
          startYLocal -
            centerY,
          startXLocal -
            centerX
        );

      const currentAngle =
        Math.atan2(
          localMouse.y -
            centerY,
          localMouse.x -
            centerX
        );

      const rotation =
        (currentAngle -
          startAngle) *
        (180 / Math.PI);

      const rotationMatrix =
        rotationAroundPoint(
          rotation,
          centerX,
          centerY
        );

      const newMatrix =
        rotationMatrix.multiply(
          originalMatrix
        );

      setLocalMatrix(
        element,
        newMatrix
      );
    };

    let startXLocal = 0;
    let startYLocal = 0;

    // -----------------------------------------------------
    // MOUSE DOWN
    // -----------------------------------------------------

    const handleMouseDown = (
      event
    ) => {
      const target =
        event.target;

      if (!target)
        return;

      // ---------------------------------------------------
      // EDITOR HANDLE
      // ---------------------------------------------------

      const handle =
        target.getAttribute(
          "data-handle"
        );

      if (
        handle &&
        selectedElement
      ) {
        const position =
          getMousePosition(
            event
          );

        startX =
          position.x;

        startY =
          position.y;

        originalBBox =
          selectedElement.getBBox();

        originalMatrix =
          getLocalMatrix(
            selectedElement
          );

        originalScreenMatrix =
          selectedElement.getScreenCTM();

        // Save local starting mouse position
        // for rotation.
        const localStart =
          svgToLocal(
            selectedElement,
            position.x,
            position.y,
            originalScreenMatrix
          );

        startXLocal =
          localStart.x;

        startYLocal =
          localStart.y;

        if (
          selectedElement.tagName ===
          "line"
        ) {
          originalLine = {
            x1:
              parseFloat(
                selectedElement.getAttribute(
                  "x1"
                )
              ),

            y1:
              parseFloat(
                selectedElement.getAttribute(
                  "y1"
                )
              ),

            x2:
              parseFloat(
                selectedElement.getAttribute(
                  "x2"
                )
              ),

            y2:
              parseFloat(
                selectedElement.getAttribute(
                  "y2"
                )
              ),
          };

          originalArrowHead =
            findArrowHead(
              selectedElement
            );
        }

        interaction = {
          type:
            handle === "rotate"
              ? "rotate"
              : handle.startsWith(
                  "arrow-"
                )
              ? handle
              : "resize",

          handle,
        };

        event.preventDefault();
        event.stopPropagation();

        return;
      }

      // ---------------------------------------------------
      // EMPTY SVG
      // ---------------------------------------------------

      if (
        target === svg ||
        target === editorLayer
      ) {
        selectedElement =
          null;

        updateEditorUI();

        return;
      }

      // ---------------------------------------------------
      // IGNORE EDITOR UI
      // ---------------------------------------------------

      if (
        target.hasAttribute(
          "data-editor-ui"
        )
      ) {
        return;
      }

      // ---------------------------------------------------
      // SELECT ELEMENT
      // ---------------------------------------------------

      selectElement(target);

      const position =
        getMousePosition(
          event
        );

      startX =
        position.x;

      startY =
        position.y;

      originalBBox =
        target.getBBox();

      originalMatrix =
        getLocalMatrix(
          target
        );

      originalScreenMatrix =
        target.getScreenCTM();

      const localStart =
        svgToLocal(
          target,
          position.x,
          position.y,
          originalScreenMatrix
        );

      startXLocal =
        localStart.x;

      startYLocal =
        localStart.y;

      interaction = {
        type:
          target.tagName ===
          "line"
            ? "arrow-move"
            : "move",
      };

      if (
        target.tagName === "line"
      ) {
        originalLine = {
          x1:
            parseFloat(
              target.getAttribute(
                "x1"
              )
            ),

          y1:
            parseFloat(
              target.getAttribute(
                "y1"
              )
            ),

          x2:
            parseFloat(
              target.getAttribute(
                "x2"
              )
            ),

          y2:
            parseFloat(
              target.getAttribute(
                "y2"
              )
            ),
        };

        originalArrowHead =
          findArrowHead(
            target
          );
      }

      event.preventDefault();
    };

    // -----------------------------------------------------
    // MOUSE MOVE
    // -----------------------------------------------------

    const handleMouseMove = (
      event
    ) => {
      if (
        !interaction ||
        !selectedElement
      ) {
        return;
      }

      const position =
        getMousePosition(
          event
        );

      const dx =
        position.x -
        startX;

      const dy =
        position.y -
        startY;

      // ---------------------------------------------------
      // MOVE ARROW
      // ---------------------------------------------------

      if (
        interaction.type ===
        "arrow-move"
      ) {
        if (
          originalLine
        ) {
          selectedElement.setAttribute(
            "x1",
            originalLine.x1 +
              dx
          );

          selectedElement.setAttribute(
            "y1",
            originalLine.y1 +
              dy
          );

          selectedElement.setAttribute(
            "x2",
            originalLine.x2 +
              dx
          );

          selectedElement.setAttribute(
            "y2",
            originalLine.y2 +
              dy
          );

          if (
            originalArrowHead
          ) {
            const points =
              originalArrowHead
                .getAttribute(
                  "points"
                )
                ?.trim()
                .split(/\s+/);

            if (points) {
              const newPoints =
                points
                  .map(
                    (point) => {
                      const [
                        x,
                        y,
                      ] =
                        point
                          .split(
                            ","
                          )
                          .map(
                            Number
                          );

                      return `${x + dx},${
                        y + dy
                      }`;
                    }
                  )
                  .join(" ");

              originalArrowHead.setAttribute(
                "points",
                newPoints
              );
            }
          }
        }

        updateEditorUI();

        return;
      }

      // ---------------------------------------------------
      // ARROW START
      // ---------------------------------------------------

      if (
        interaction.type ===
        "arrow-start"
      ) {
        selectedElement.setAttribute(
          "x1",
          position.x
        );

        selectedElement.setAttribute(
          "y1",
          position.y
        );

        updateArrowHead(
          selectedElement,
          originalArrowHead
        );

        updateEditorUI();

        return;
      }

      // ---------------------------------------------------
      // ARROW END
      // ---------------------------------------------------

      if (
        interaction.type ===
        "arrow-end"
      ) {
        selectedElement.setAttribute(
          "x2",
          position.x
        );

        selectedElement.setAttribute(
          "y2",
          position.y
        );

        updateArrowHead(
          selectedElement,
          originalArrowHead
        );

        updateEditorUI();

        return;
      }

      // ---------------------------------------------------
      // RESIZE
      // ---------------------------------------------------

      if (
        interaction.type ===
        "resize"
      ) {
        resizeElement(
          selectedElement,
          interaction.handle,
          position.x,
          position.y
        );

        updateEditorUI();

        return;
      }

      // ---------------------------------------------------
      // ROTATE
      // ---------------------------------------------------

      if (
        interaction.type ===
        "rotate"
      ) {
        rotateElement(
          selectedElement,
          position.x,
          position.y
        );

        updateEditorUI();

        return;
      }

      // ---------------------------------------------------
      // MOVE NORMAL ELEMENT
      // ---------------------------------------------------

      if (
        interaction.type ===
        "move"
      ) {
        moveElement(
          selectedElement,
          dx,
          dy
        );

        updateEditorUI();
      }
    };

    // -----------------------------------------------------
    // MOUSE UP
    // -----------------------------------------------------

    const handleMouseUp = () => {
      interaction = null;
    };

    // -----------------------------------------------------
    // DOUBLE CLICK TEXT
    // -----------------------------------------------------

    const handleDoubleClick = (
      event
    ) => {
      let target =
        event.target;

      if (!target)
        return;

      const textElement =
        target.closest(
          "text"
        );

      if (!textElement)
        return;

      const currentText =
        textElement.textContent ||
        "";

      const newText =
        window.prompt(
          "Edit text:",
          currentText
        );

      if (
        newText !== null &&
        newText.trim() !== ""
      ) {
        textElement.textContent =
          newText.trim();
      }

      updateEditorUI();
    };

    // -----------------------------------------------------
    // EVENTS
    // -----------------------------------------------------

    svg.addEventListener(
      "mousedown",
      handleMouseDown
    );

    svg.addEventListener(
      "mousemove",
      handleMouseMove
    );

    svg.addEventListener(
      "mouseup",
      handleMouseUp
    );

    svg.addEventListener(
      "mouseleave",
      handleMouseUp
    );

    svg.addEventListener(
      "dblclick",
      handleDoubleClick
    );

    // -----------------------------------------------------
    // INITIALIZE ELEMENTS
    // -----------------------------------------------------

    const allElements =
      svg.querySelectorAll(
        "rect, circle, ellipse, polygon, path, text, line"
      );

    allElements.forEach(
      (element) => {
        if (
          element.hasAttribute(
            "data-editor-ui"
          )
        ) {
          return;
        }

        // Don't modify arrows.
        if (
          element.tagName ===
          "line"
        ) {
          return;
        }

        if (
          !element.hasAttribute(
            "data-editor-ui"
          )
        ) {
          element.style.cursor =
            "move";
        }
      }
    );

    // -----------------------------------------------------
    // CLEANUP
    // -----------------------------------------------------

    return () => {
      svg.removeEventListener(
        "mousedown",
        handleMouseDown
      );

      svg.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      svg.removeEventListener(
        "mouseup",
        handleMouseUp
      );

      svg.removeEventListener(
        "mouseleave",
        handleMouseUp
      );

      svg.removeEventListener(
        "dblclick",
        handleDoubleClick
      );

      if (
        editorLayer.parentNode
      ) {
        editorLayer.parentNode.removeChild(
          editorLayer
        );
      }
    };
  }, [isEditMode, drawingSVG]);

  // =====================================================
  // START RECORDING
  // =====================================================

  const startRecording = async () => {
    try {
      setError("");
      setTranslation("");
      setDetectedLanguage("Unknown");
      setProcessingTime(null);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder =
        new MediaRecorder(
          stream
        );

      mediaRecorderRef.current =
        recorder;

      audioChunksRef.current =
        [];

      recorder.ondataavailable =
        (event) => {
          if (
            event.data.size > 0
          ) {
            audioChunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop =
        async () => {
          const audioBlob =
            new Blob(
              audioChunksRef.current,
              {
                type:
                  "audio/webm",
              }
            );

          const recordedFile =
            new File(
              [audioBlob],
              "voxaai_recording.webm",
              {
                type:
                  "audio/webm",
              }
            );

          setAudioFile(
            recordedFile
          );

          await processAudio(
            recordedFile
          );

          stream
            .getTracks()
            .forEach(
              (track) =>
                track.stop()
            );
        };

      recorder.start();

      setIsRecording(
        true
      );
    } catch (err) {
      console.error(err);

      setError(
        "Microphone permission was denied or unavailable."
      );
    }
  };

  // =====================================================
  // STOP RECORDING
  // =====================================================

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !==
        "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  // =====================================================
  // MICROPHONE BUTTON
  // =====================================================

  const handleMicrophoneClick = () => {
    if (isProcessing)
      return;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // =====================================================
  // FILE UPLOAD
  // =====================================================

  const handleFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setAudioFile(file);

    processAudio(file);

    event.target.value = "";
  };

  // =====================================================
  // COPY TRANSLATION
  // =====================================================

  const copyTranslation =
    async () => {
      if (!translation)
        return;

      try {
        await navigator.clipboard.writeText(
          translation
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1800);
      } catch (err) {
        console.error(err);
      }
    };

  // =====================================================
  // DOWNLOAD TRANSLATION
  // =====================================================

  const downloadTranslation =
    () => {
      if (!translation)
        return;

      const blob =
        new Blob(
          [translation],
          {
            type:
              "text/plain",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "voxaai-english-translation.txt";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );
    };

  // =====================================================
  // CLEAR TRANSLATION
  // =====================================================

  const clearTranslation =
    () => {
      setTranslation("");
      setIsVisualCommand(false);
      setVisualDescription("");
      setDrawingSVG("");
      setDetectedLanguage("Unknown");
      setProcessingTime(null);
      setError("");
      setCopied(false);
      setAudioFile(null);
      setIsEditMode(false);
    };

  // =====================================================
  // VIEW DRAWING FULL SCREEN
  // =====================================================

  const viewDrawingFullscreen =
    () => {
      const drawingElement =
        document.getElementById(
          "ai-drawing"
        );

      if (!drawingElement)
        return;

      if (
        drawingElement.requestFullscreen
      ) {
        drawingElement.requestFullscreen();
      }
    };

  // =====================================================
  // DOWNLOAD DRAWING
  // =====================================================

  const downloadDrawing =
    () => {
      const container =
        drawingContainerRef.current;

      if (!container)
        return;

      const svg =
        container.querySelector(
          "svg"
        );

      if (!svg)
        return;

      const svgClone =
        svg.cloneNode(
          true
        );

      const editorElements =
        svgClone.querySelectorAll(
          '[data-editor-ui="true"]'
        );

      editorElements.forEach(
        (element) => {
          element.remove();
        }
      );

      const serializer =
        new XMLSerializer();

      const svgString =
        serializer.serializeToString(
          svgClone
        );

      const blob =
        new Blob(
          [svgString],
          {
            type:
              "image/svg+xml;charset=utf-8",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "voxaai-ai-drawing.svg";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );
    };

    // =====================================================
    // DOWNLOAD EDITABLE POWERPOINT
    // =====================================================

    const downloadDrawingPPTX = async () => {
      const container =
        drawingContainerRef.current;

      if (!container) {
        setError("Drawing container not found.");
        return;
      }

      const svg =
        container.querySelector("svg");

      if (!svg) {
        setError("SVG drawing not found.");
        return;
      }

      try {
        const pptx =
          new pptxGen();

        pptx.layout =
          "LAYOUT_WIDE";

        pptx.author =
          "VoxaAI";

        pptx.subject =
          "VoxaAI AI Drawing";

        pptx.title =
          "VoxaAI Editable Drawing";

        const slide =
          pptx.addSlide();

        // -------------------------------------------------
        // SVG DIMENSIONS
        // -------------------------------------------------

        const viewBox =
          svg.viewBox?.baseVal;

        const svgWidth =
          viewBox?.width ||
          parseFloat(
            svg.getAttribute("width")
          ) ||
          800;

        const svgHeight =
          viewBox?.height ||
          parseFloat(
            svg.getAttribute("height")
          ) ||
          600;

        // PowerPoint dimensions
        const slideWidth =
          13.333;

        const slideHeight =
          7.5;

        const margin =
          0.4;

        const scale =
          Math.min(
            (slideWidth -
              margin * 2) /
              svgWidth,

            (slideHeight -
              margin * 2) /
              svgHeight
          );

        const offsetX =
          (slideWidth -
            svgWidth * scale) /
          2;

        const offsetY =
          (slideHeight -
            svgHeight * scale) /
          2;

        const X = (value) =>
          offsetX +
          value * scale;

        const Y = (value) =>
          offsetY +
          value * scale;

        const W = (value) =>
          value * scale;

        const H = (value) =>
          value * scale;

        // -------------------------------------------------
        // COLOR CONVERTER
        // -------------------------------------------------

        const getColor = (
          element,
          property
        ) => {
          let color =
            element.getAttribute(
              property
            );

          if (!color) {
            color =
              window
                .getComputedStyle(
                  element
                )
                .getPropertyValue(
                  property
                );
          }

          if (!color) {
            return "000000";
          }

          color =
            color.trim();

          // RGB
          const rgb =
            color.match(
              /^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/
            );

          if (rgb) {
            return [
              Number(rgb[1]),
              Number(rgb[2]),
              Number(rgb[3]),
            ]
              .map(
                (value) =>
                  value
                    .toString(16)
                    .padStart(
                      2,
                      "0"
                    )
              )
              .join("")
              .toUpperCase();
          }

          // RGBA
          const rgba =
            color.match(
              /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+)/
            );

          if (rgba) {
            return [
              Number(rgba[1]),
              Number(rgba[2]),
              Number(rgba[3]),
            ]
              .map(
                (value) =>
                  value
                    .toString(16)
                    .padStart(
                      2,
                      "0"
                    )
              )
              .join("")
              .toUpperCase();
          }

          // HEX
          if (
            color.startsWith("#")
          ) {
            return color
              .replace(
                "#",
                ""
              )
              .substring(
                0,
                6
              )
              .toUpperCase();
          }

          return "000000";
        };

        // -------------------------------------------------
        // EXPORT RECTANGLES
        // -------------------------------------------------

        svg
          .querySelectorAll("rect")
          .forEach(
            (element) => {
              if (
                element.hasAttribute(
                  "data-editor-ui"
                )
              ) {
                return;
              }

              const x =
                parseFloat(
                  element.getAttribute(
                    "x"
                  )
                ) || 0;

              const y =
                parseFloat(
                  element.getAttribute(
                    "y"
                  )
                ) || 0;

              const width =
                parseFloat(
                  element.getAttribute(
                    "width"
                  )
                ) || 0;

              const height =
                parseFloat(
                  element.getAttribute(
                    "height"
                  )
                ) || 0;

              const fill =
                getColor(
                  element,
                  "fill"
                );

              const stroke =
                getColor(
                  element,
                  "stroke"
                );

              const rx =
                parseFloat(
                  element.getAttribute(
                    "rx"
                  )
                ) || 0;

              slide.addShape(
                rx > 0
                  ? pptx.ShapeType
                      .roundRect
                  : pptx.ShapeType
                      .rect,
                {
                  x: X(x),
                  y: Y(y),
                  w: W(width),
                  h: H(height),

                  fill: {
                    color: fill,
                  },

                  line: {
                    color:
                      stroke,
                    width: 1,
                  },
                }
              );
            }
          );

        // -------------------------------------------------
        // EXPORT ELLIPSES
        // -------------------------------------------------

        svg
          .querySelectorAll(
            "ellipse,circle"
          )
          .forEach(
            (element) => {
              if (
                element.hasAttribute(
                  "data-editor-ui"
                )
              ) {
                return;
              }

              let cx;
              let cy;
              let rx;
              let ry;

              if (
                element.tagName
                  .toLowerCase() ===
                "circle"
              ) {
                cx =
                  parseFloat(
                    element.getAttribute(
                      "cx"
                    )
                  ) || 0;

                cy =
                  parseFloat(
                    element.getAttribute(
                      "cy"
                    )
                  ) || 0;

                rx =
                  parseFloat(
                    element.getAttribute(
                      "r"
                    )
                  ) || 0;

                ry = rx;
              } else {
                cx =
                  parseFloat(
                    element.getAttribute(
                      "cx"
                    )
                  ) || 0;

                cy =
                  parseFloat(
                    element.getAttribute(
                      "cy"
                    )
                  ) || 0;

                rx =
                  parseFloat(
                    element.getAttribute(
                      "rx"
                    )
                  ) || 0;

                ry =
                  parseFloat(
                    element.getAttribute(
                      "ry"
                    )
                  ) || 0;
              }

              slide.addShape(
                pptx.ShapeType
                  .ellipse,
                {
                  x: X(cx - rx),
                  y: Y(cy - ry),
                  w: W(rx * 2),
                  h: H(ry * 2),

                  fill: {
                    color:
                      getColor(
                        element,
                        "fill"
                      ),
                  },

                  line: {
                    color:
                      getColor(
                        element,
                        "stroke"
                      ),
                    width: 1,
                  },
                }
              );
            }
          );

        // -------------------------------------------------
        // EXPORT DIAMONDS
        // -------------------------------------------------

        svg
          .querySelectorAll(
            "polygon"
          )
          .forEach(
            (element) => {
              if (
                element.hasAttribute(
                  "data-editor-ui"
                )
              ) {
                return;
              }

              const points =
                element.getAttribute(
                  "points"
                );

              if (!points)
                return;

              const values =
                points
                  .trim()
                  .split(/\s+/)
                  .map(
                    (point) =>
                      point
                        .split(",")
                        .map(Number)
                  );

              if (
                values.length !==
                4
              ) {
                return;
              }

              const xs =
                values.map(
                  (p) => p[0]
                );

              const ys =
                values.map(
                  (p) => p[1]
                );

              const minX =
                Math.min(...xs);

              const maxX =
                Math.max(...xs);

              const minY =
                Math.min(...ys);

              const maxY =
                Math.max(...ys);

              slide.addShape(
                pptx.ShapeType
                  .diamond,
                {
                  x: X(minX),
                  y: Y(minY),
                  w: W(maxX - minX),
                  h: H(maxY - minY),

                  fill: {
                    color:
                      getColor(
                        element,
                        "fill"
                      ),
                  },

                  line: {
                    color:
                      getColor(
                        element,
                        "stroke"
                      ),
                    width: 1,
                  },
                }
              );
            }
          );

        // -------------------------------------------------
        // EXPORT LINES
        // -------------------------------------------------

        svg
          .querySelectorAll(
            "line"
          )
          .forEach(
            (element) => {
              if (
                element.hasAttribute(
                  "data-editor-ui"
                )
              ) {
                return;
              }

              const x1 =
                parseFloat(
                  element.getAttribute(
                    "x1"
                  )
                ) || 0;

              const y1 =
                parseFloat(
                  element.getAttribute(
                    "y1"
                  )
                ) || 0;

              const x2 =
                parseFloat(
                  element.getAttribute(
                    "x2"
                  )
                ) || 0;

              const y2 =
                parseFloat(
                  element.getAttribute(
                    "y2"
                  )
                ) || 0;

              slide.addShape(
                pptx.ShapeType.line,
                {
                  x: X(x1),
                  y: Y(y1),

                  w:
                    X(x2) -
                    X(x1),

                  h:
                    Y(y2) -
                    Y(y1),

                  line: {
                    color:
                      getColor(
                        element,
                        "stroke"
                      ),
                    width: 1.5,

                    endArrowType:
                      "triangle",
                  },
                }
              );
            }
          );

        // -------------------------------------------------
        // EXPORT TEXT
        // -------------------------------------------------

        svg
          .querySelectorAll(
            "text"
          )
          .forEach(
            (element) => {
              if (
                element.hasAttribute(
                  "data-editor-ui"
                )
              ) {
                return;
              }

              const text =
                element.textContent?.trim();

              if (!text)
                return;

              const x =
                parseFloat(
                  element.getAttribute(
                    "x"
                  )
                ) || 0;

              const y =
                parseFloat(
                  element.getAttribute(
                    "y"
                  )
                ) || 0;

              const fontSize =
                parseFloat(
                  window
                    .getComputedStyle(
                      element
                    )
                    .fontSize
                ) || 16;

              const fontWeight =
                window
                  .getComputedStyle(
                    element
                  )
                  .fontWeight;

              const anchor =
                element.getAttribute(
                  "text-anchor"
                );

              slide.addText(
                text,
                {
                  x:
                    X(x) -
                    1.0,

                  y:
                    Y(y) -
                    0.15,

                  w: 2.0,
                  h: 0.45,

                  fontSize:
                    Math.max(
                      8,
                      fontSize *
                        0.75 *
                        scale
                    ),

                  bold:
                    fontWeight ===
                      "bold" ||
                    Number(
                      fontWeight
                    ) >= 600,

                  color:
                    getColor(
                      element,
                      "fill"
                    ),

                  align:
                    anchor ===
                    "middle"
                      ? "center"
                      : "left",

                  margin: 0,
                }
              );
            }
          );

        // -------------------------------------------------
        // DOWNLOAD
        // -------------------------------------------------

        await pptx.writeFile({
          fileName:
            "voxaai-editable-drawing.pptx",
        });

        console.log(
          "VoxaAI PowerPoint downloaded successfully."
        );

      } catch (error) {

        console.error(
          "PPTX EXPORT ERROR:",
          error
        );

        setError(
          `PowerPoint export failed: ${
            error.message ||
            "Unknown error"
          }`
        );

        alert(
          `PowerPoint export failed:\n\n${
            error.message ||
            "Unknown error"
          }`
        );
      }
    };

    // =====================================================
    // EXPORT DRAWING AS XML
    // =====================================================

    const downloadDrawingXML = () => {
    const container = drawingContainerRef.current;

    if (!container) {
      setError("Drawing container not found.");
      return;
    }

    const svg = container.querySelector("svg");

    if (!svg) {
      setError("SVG drawing not found.");
      return;
    }

    try {
      // =========================================================
      // CLONE SVG
      // =========================================================

      const svgClone = svg.cloneNode(true);

      // Remove editor UI / selection handles
      svgClone
        .querySelectorAll('[data-editor-ui="true"]')
        .forEach((element) => {
          element.remove();
        });

      // =========================================================
      // SVG DIMENSIONS
      // =========================================================

      const viewBox = svgClone.getAttribute("viewBox");

      let svgWidth =
        parseFloat(svgClone.getAttribute("width")) || 1200;

      let svgHeight =
        parseFloat(svgClone.getAttribute("height")) || 800;

      if (viewBox) {
        const parts = viewBox
          .trim()
          .split(/\s+/)
          .map(Number);

        if (parts.length === 4) {
          svgWidth = parts[2];
          svgHeight = parts[3];
        }
      }

      // =========================================================
      // CREATE NATIVE DRAW.IO XML
      // =========================================================

      const mxfile =
        document.implementation.createDocument(
          "",
          "mxfile",
          null
        );

      const fileRoot = mxfile.documentElement;

      fileRoot.setAttribute(
        "host",
        "VoxaAI"
      );

      fileRoot.setAttribute(
        "modified",
        new Date().toISOString()
      );

      fileRoot.setAttribute(
        "agent",
        "VoxaAI"
      );

      fileRoot.setAttribute(
        "version",
        "1.0"
      );

      // ---------------------------------------------------------
      // DIAGRAM
      // ---------------------------------------------------------

      const diagram =
        mxfile.createElement("diagram");

      diagram.setAttribute(
        "id",
        "voxaai-drawing"
      );

      diagram.setAttribute(
        "name",
        "VoxaAI Drawing"
      );

      fileRoot.appendChild(diagram);

      // ---------------------------------------------------------
      // MXGRAPH MODEL
      // ---------------------------------------------------------

      const model =
        mxfile.createElement("mxGraphModel");

      model.setAttribute("dx", "1200");
      model.setAttribute("dy", "800");
      model.setAttribute("grid", "1");
      model.setAttribute("gridSize", "10");
      model.setAttribute("guides", "1");
      model.setAttribute("tooltips", "1");
      model.setAttribute("connect", "1");
      model.setAttribute("arrows", "1");
      model.setAttribute("fold", "1");
      model.setAttribute("page", "1");
      model.setAttribute("pageScale", "1");
      model.setAttribute("pageWidth", "1200");
      model.setAttribute("pageHeight", "800");

      diagram.appendChild(model);

      // =========================================================
      // ROOT
      // =========================================================

      const root =
        mxfile.createElement("root");

      model.appendChild(root);

      const cell0 =
        mxfile.createElement("mxCell");

      cell0.setAttribute("id", "0");

      root.appendChild(cell0);

      const cell1 =
        mxfile.createElement("mxCell");

      cell1.setAttribute("id", "1");
      cell1.setAttribute("parent", "0");

      root.appendChild(cell1);

      // =========================================================
      // HELPERS
      // =========================================================

      const getNumber = (value, fallback = 0) => {
        const n = parseFloat(value);
        return Number.isFinite(n) ? n : fallback;
      };

      const getStyleValue = (
        element,
        property,
        fallback = null
      ) => {
        const attr =
          element.getAttribute(property);

        if (attr !== null) {
          return attr;
        }

        const style =
          element.getAttribute("style");

        if (!style) {
          return fallback;
        }

        const match =
          style.match(
            new RegExp(
              `${property}\\s*:\\s*([^;]+)`,
              "i"
            )
          );

        return match
          ? match[1].trim()
          : fallback;
      };

      const cleanColor = (color) => {
        if (!color) return null;

        color = color.trim();

        if (
          color === "none" ||
          color === "transparent"
        ) {
          return null;
        }

        return color;
      };

      // =========================================================
      // SVG -> DRAW.IO STYLE
      // =========================================================

      const getCommonStyle = (element) => {
        let style = "";

        const fill =
          cleanColor(
            getStyleValue(
              element,
              "fill",
              "#ffffff"
            )
          );

        const stroke =
          cleanColor(
            getStyleValue(
              element,
              "stroke",
              "#000000"
            )
          );

        const strokeWidth =
          getNumber(
            getStyleValue(
              element,
              "stroke-width",
              1
            ),
            1
          );

        const opacity =
          getNumber(
            getStyleValue(
              element,
              "opacity",
              1
            ),
            1
          );

        if (fill) {
          style += `fillColor=${fill};`;
        } else {
          style += "fillColor=none;";
        }

        if (stroke) {
          style += `strokeColor=${stroke};`;
        } else {
          style += "strokeColor=none;";
        }

        style +=
          `strokeWidth=${strokeWidth};`;

        if (opacity !== 1) {
          style +=
            `opacity=${opacity * 100};`;
        }

        return style;
      };

      // =========================================================
      // CREATE VERTEX
      // =========================================================

      const createVertex = (
        element,
        index
      ) => {
        const tag =
          element.tagName.toLowerCase();

        const cell =
          mxfile.createElement("mxCell");

        cell.setAttribute(
          "id",
          `element-${index}`
        );

        cell.setAttribute(
          "parent",
          "1"
        );

        cell.setAttribute(
          "vertex",
          "1"
        );

        let style =
          getCommonStyle(element);

        // -------------------------------------------------------
        // RECTANGLE
        // -------------------------------------------------------

        if (tag === "rect") {
          style += "rounded=0;";
        }

        // -------------------------------------------------------
        // CIRCLE / ELLIPSE
        // -------------------------------------------------------

        else if (
          tag === "circle" ||
          tag === "ellipse"
        ) {
          style += "shape=ellipse;";
        }

        // -------------------------------------------------------
        // TEXT
        // -------------------------------------------------------

        else if (tag === "text") {
          style +=
            "shape=label;" +
            "whiteSpace=wrap;" +
            "html=0;" +
            "align=center;" +
            "verticalAlign=middle;";

          const fontSize =
            getStyleValue(
              element,
              "font-size",
              "14"
            );

          style +=
            `fontSize=${parseInt(fontSize) || 14};`;

          const fontColor =
            cleanColor(
              getStyleValue(
                element,
                "fill",
                "#000000"
              )
            );

          if (fontColor) {
            style +=
              `fontColor=${fontColor};`;
          }
        }

        // -------------------------------------------------------
        // POLYGON
        // -------------------------------------------------------

        else if (tag === "polygon") {
          const points =
            element.getAttribute("points") || "";

          const pointList =
            points
              .trim()
              .split(/\s+/)
              .map((p) => {
                const [x, y] =
                  p.split(",").map(Number);

                return {
                  x,
                  y
                };
              })
              .filter(
                (p) =>
                  Number.isFinite(p.x) &&
                  Number.isFinite(p.y)
              );

          // Detect diamond / gateway
          if (pointList.length === 4) {
            style += "shape=rhombus;";
          }
        }

        cell.setAttribute(
          "style",
          style
        );

        // =======================================================
        // GEOMETRY
        // =======================================================

        let x = 0;
        let y = 0;
        let width = 100;
        let height = 60;

        if (tag === "rect") {
          x = getNumber(
            element.getAttribute("x")
          );

          y = getNumber(
            element.getAttribute("y")
          );

          width = getNumber(
            element.getAttribute("width"),
            100
          );

          height = getNumber(
            element.getAttribute("height"),
            60
          );
        }

        else if (tag === "circle") {
          const cx =
            getNumber(
              element.getAttribute("cx")
            );

          const cy =
            getNumber(
              element.getAttribute("cy")
            );

          const r =
            getNumber(
              element.getAttribute("r"),
              30
            );

          x = cx - r;
          y = cy - r;
          width = r * 2;
          height = r * 2;
        }

        else if (tag === "ellipse") {
          const cx =
            getNumber(
              element.getAttribute("cx")
            );

          const cy =
            getNumber(
              element.getAttribute("cy")
            );

          const rx =
            getNumber(
              element.getAttribute("rx"),
              50
            );

          const ry =
            getNumber(
              element.getAttribute("ry"),
              30
            );

          x = cx - rx;
          y = cy - ry;
          width = rx * 2;
          height = ry * 2;
        }

        else if (tag === "text") {
          x =
            getNumber(
              element.getAttribute("x")
            );

          y =
            getNumber(
              element.getAttribute("y")
            );

          width = 120;
          height = 40;
        }

        else {
          // Use SVG bounding box
          try {
            const bbox =
              element.getBBox();

            x = bbox.x;
            y = bbox.y;
            width = bbox.width;
            height = bbox.height;
          } catch {
            return;
          }
        }

        // -------------------------------------------------------
        // GEOMETRY NODE
        // -------------------------------------------------------

        const geometry =
          mxfile.createElement(
            "mxGeometry"
          );

        geometry.setAttribute(
          "x",
          String(x)
        );

        geometry.setAttribute(
          "y",
          String(y)
        );

        geometry.setAttribute(
          "width",
          String(Math.max(width, 1))
        );

        geometry.setAttribute(
          "height",
          String(Math.max(height, 1))
        );

        geometry.setAttribute(
          "as",
          "geometry"
        );

        cell.appendChild(
          geometry
        );

        // -------------------------------------------------------
        // TEXT VALUE
        // -------------------------------------------------------

        if (tag === "text") {
          cell.setAttribute(
            "value",
            element.textContent || ""
          );
        }

        root.appendChild(cell);
      };

      // =========================================================
      // CREATE EDGE / ARROW
      // =========================================================

      const createEdge = (
        element,
        index
      ) => {
        const tag =
          element.tagName.toLowerCase();

        const cell =
          mxfile.createElement("mxCell");

        cell.setAttribute(
          "id",
          `edge-${index}`
        );

        cell.setAttribute(
          "parent",
          "1"
        );

        cell.setAttribute(
          "edge",
          "1"
        );

        let style =
          "edgeStyle=orthogonalEdgeStyle;" +
          "rounded=0;" +
          "orthogonalLoop=1;" +
          "jettySize=auto;" +
          "html=1;" +
          "endArrow=block;" +
          "endFill=1;";

        const stroke =
          cleanColor(
            getStyleValue(
              element,
              "stroke",
              "#000000"
            )
          );

        if (stroke) {
          style +=
            `strokeColor=${stroke};`;
        }

        const strokeWidth =
          getNumber(
            getStyleValue(
              element,
              "stroke-width",
              1
            ),
            1
          );

        style +=
          `strokeWidth=${strokeWidth};`;

        cell.setAttribute(
          "style",
          style
        );

        // -------------------------------------------------------
        // FIND LINE COORDINATES
        // -------------------------------------------------------

        let x1 = 0;
        let y1 = 0;
        let x2 = 100;
        let y2 = 0;

        if (tag === "line") {
          x1 =
            getNumber(
              element.getAttribute("x1")
            );

          y1 =
            getNumber(
              element.getAttribute("y1")
            );

          x2 =
            getNumber(
              element.getAttribute("x2")
            );

          y2 =
            getNumber(
              element.getAttribute("y2")
            );
        }

        else {
          try {
            const bbox =
              element.getBBox();

            x1 = bbox.x;
            y1 = bbox.y;
            x2 =
              bbox.x + bbox.width;
            y2 =
              bbox.y + bbox.height;
          } catch {
            return;
          }
        }

        // -------------------------------------------------------
        // EDGE GEOMETRY
        // -------------------------------------------------------

        const geometry =
          mxfile.createElement(
            "mxGeometry"
          );

        geometry.setAttribute(
          "relative",
          "1"
        );

        geometry.setAttribute(
          "as",
          "geometry"
        );

        const point =
          mxfile.createElement(
            "mxPoint"
          );

        point.setAttribute(
          "x",
          String(x1)
        );

        point.setAttribute(
          "y",
          String(y1)
        );

        point.setAttribute(
          "as",
          "sourcePoint"
        );

        geometry.appendChild(point);

        const targetPoint =
          mxfile.createElement(
            "mxPoint"
          );

        targetPoint.setAttribute(
          "x",
          String(x2)
        );

        targetPoint.setAttribute(
          "y",
          String(y2)
        );

        targetPoint.setAttribute(
          "as",
          "targetPoint"
        );

        geometry.appendChild(
          targetPoint
        );

        cell.appendChild(
          geometry
        );

        root.appendChild(cell);
      };

      // =========================================================
      // PROCESS SVG ELEMENTS
      // =========================================================

      const elements =
        svgClone.querySelectorAll(
          "rect, circle, ellipse, polygon, text, line, polyline, path"
        );

      let vertexIndex = 1;
      let edgeIndex = 1;

      elements.forEach((element) => {
        const tag =
          element.tagName.toLowerCase();

        // -------------------------------------------------------
        // LINES / ARROWS
        // -------------------------------------------------------

        if (
          tag === "line" ||
          tag === "polyline"
        ) {
          createEdge(
            element,
            edgeIndex++
          );

          return;
        }

        // -------------------------------------------------------
        // PATHS
        // -------------------------------------------------------

        if (tag === "path") {
          const d =
            element.getAttribute("d") || "";

          // Most drawing arrows/connection lines
          // are paths without fill.
          const fill =
            getStyleValue(
              element,
              "fill",
              "none"
            );

          if (
            fill === "none" ||
            !fill
          ) {
            createEdge(
              element,
              edgeIndex++
            );

            return;
          }
        }

        // -------------------------------------------------------
        // NORMAL SHAPES
        // -------------------------------------------------------

        createVertex(
          element,
          vertexIndex++
        );
      });

      // =========================================================
      // SERIALIZE
      // =========================================================

      const serializer =
        new XMLSerializer();

      const xmlContent =
        serializer.serializeToString(
          mxfile
        );

      const formattedXML =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        xmlContent;

      // =========================================================
      // DOWNLOAD
      // =========================================================

      const blob =
        new Blob(
          [formattedXML],
          {
            type:
              "application/xml;charset=utf-8"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "voxaai-ai-drawing.drawio";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(
        "Draw.io XML export failed:",
        error
      );

      setError(
        "Could not export the drawing as an editable Draw.io XML file."
      );
    }
  };

  return (
    <div className="app">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="sky-glow sky-glow-one"></div>
      <div className="sky-glow sky-glow-two"></div>
      <div className="sky-cloud cloud-one"></div>
      <div className="sky-cloud cloud-two"></div>

      <main className="main-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="top-header">

          <div className="brand">

            <img
              src="/voxa_icon.jpeg"
              alt="VoxaAI"
              className="brand-logo-image"
            />

            <span>
              VoxaAI
            </span>

          </div>

          <div className="header-status">

            <span className="status-dot"></span>

            <span>
              AI Speech Translator
            </span>

          </div>

        </header>

        <nav className="voxa-tabs">

          <button
            className={
              activeTab === "translator"
                ? "voxa-tab active"
                : "voxa-tab"
            }
            onClick={() =>
              setActiveTab("translator")
            }
          >
            🎙️ Speech Translator
          </button>

          <button
            className={
              activeTab === "bpmn"
                ? "voxa-tab active"
                : "voxa-tab"
            }
            onClick={() =>
              setActiveTab("bpmn")
            }
          >
            📝 BPMN Editor
          </button>

        </nav>

        {activeTab === "translator" && (
          <>
        

        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero">

          <div className="hero-badge">

            <span>
              ✦
            </span>

            AI-POWERED SPEECH TRANSLATOR

          </div>

          <h1>

            Your Voice.
            <br />

            <span>
              Any Language.
            </span>

            <br />

            One Clear Meaning.

          </h1>

          <p>
            Speak in your language and let VoxaAI
            detect and translate your
            speech into English.
          </p>

        </section>

        {/* =================================================
            TRANSLATOR CARD
        ================================================= */}

        <section className="translator-card">

          <div className="language-bar">

            <div className="language-left">

              <button className="language-pill">
                ✦ &nbsp; Auto Detect
              </button>

              <span className="arrow">
                →
              </span>

              <button className="language-pill">
                🌐 &nbsp; English
              </button>

            </div>

            <div className="powered">

              <span className="status-dot"></span>

              Powered by Voxa-AI

            </div>

          </div>

          <div className="voice-input">

            <div className="voice-label">
              VOICE INPUT
            </div>

            <button
              className={`mic-button ${
                isRecording
                  ? "recording"
                  : ""
              }`}
              onClick={
                handleMicrophoneClick
              }
              disabled={isProcessing}
              aria-label={
                isRecording
                  ? "Stop recording"
                  : "Start recording"
              }
            >

              <MicrophoneIcon size={58} />

            </button>

            <h2>

              {isRecording
                ? "Listening..."
                : isProcessing
                ? "Processing..."
                : "Start Speaking"}

            </h2>

            <p>

              {isRecording
                ? "Speak naturally. Click again when finished."
                : "Click the microphone and speak naturally"}

            </p>

          </div>

          <div className="audio-controls">

            <div className="audio-status">

              <div className="audio-icon">
                <WaveIcon />
              </div>

              <div className="audio-info">

                <strong>

                  {audioFile
                    ? "Audio ready"
                    : "Waiting for speech"}

                </strong>

                <span>

                  {audioFile
                    ? audioFile.name
                    : "Record or upload an audio file"}

                </span>

              </div>

              <span className="ready-dot"></span>

            </div>

            <button
              className="upload-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={isProcessing}
            >

              <UploadIcon />

              {isProcessing
                ? "Processing..."
                : "Upload Audio"}

            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              hidden
            />

            <div className="detected-language">

              <div className="detected-icon">
                <LanguageIcon />
              </div>

              <div className="detected-info">

                <span>
                  Detected Language
                </span>

                <strong>
                  {detectedLanguage}
                </strong>

              </div>

            </div>

          </div>

          {error && (
            <div className="error-message">

              <span>
                !
              </span>

              {error}

            </div>
          )}

        </section>

        {/* =================================================
            ENGLISH TRANSLATION
        ================================================= */}

        <section className="translation-card">

          <div className="translation-header">

            <div className="translation-title">

              <div className="translation-icon">
                ▣
              </div>

              <div>

                <h3>
                  English Translation
                </h3>

              </div>

            </div>

            <div className="translation-actions">

              <button
                onClick={
                  copyTranslation
                }
                disabled={!translation}
              >

                <CopyIcon />

                {copied
                  ? "Copied"
                  : "Copy"}

              </button>

              <button
                onClick={
                  downloadTranslation
                }
                disabled={!translation}
              >

                <DownloadIcon />

                Download

              </button>

            </div>

          </div>

          <div className="translation-box">

            {translation ? (
              <p className="translation-text">
                {translation}
              </p>
            ) : (
              <p className="translation-placeholder">
                Your English translation will
                appear here...
              </p>
            )}

            <span className="character-count">
              {translation.length} / 5000
            </span>

          </div>

          <div className="translation-bottom">

            <button
              className="clear-button"
              onClick={
                clearTranslation
              }
              disabled={
                !translation &&
                detectedLanguage ===
                  "Unknown"
              }
            >

              <ClearIcon />

              Clear Translation

            </button>

            <div className="processing-card">

              <div className="processing-icon">
                ⚡
              </div>

              <div>

                <span>
                  Processing Time
                </span>

                <strong>

                  {processingTime
                    ? `${processingTime}s`
                    : "--"}

                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            AI VISUAL INTERPRETATION
        ================================================= */}

        {isVisualCommand &&
          visualDescription && (
            <section className="visual-card">

              <div className="visual-header">

                <div className="visual-title">

                  <div className="visual-icon">
                    🎨
                  </div>

                  <div>

                    <h3>
                      AI Visual Interpretation
                    </h3>

                    <p>
                      VoxaAI understood your drawing command
                    </p>

                  </div>

                </div>

                <div className="visual-status">

                  <span className="status-dot"></span>

                  AI Interpreted

                </div>

              </div>

              <div className="visual-content">

                <div className="visual-command">

                  <span>
                    VISUAL COMMAND
                  </span>

                  <p>
                    {translation}
                  </p>

                </div>

                <div className="visual-description">

                  <div className="description-icon">
                    ✦
                  </div>

                  <div>

                    <span>
                      DRAWING DESCRIPTION
                    </span>

                    <p>
                      {visualDescription}
                    </p>

                  </div>

                </div>

                <div
                  className="drawing-container"
                  ref={
                    drawingContainerRef
                  }
                >

                  <div className="drawing-toolbar">

                    <div className="drawing-toolbar-title">

                      <span>
                        🎨
                      </span>

                      <strong>
                        AI Drawing Canvas
                      </strong>

                    </div>

                    <div className="drawing-actions">

                      <button
                        className="drawing-action-button"
                        onClick={() =>
                          setIsEditMode(
                            (previous) =>
                              !previous
                          )
                        }
                      >

                        ✎

                        {isEditMode
                          ? "Exit Edit"
                          : "Edit Drawing"}

                      </button>

                      <button
                        className="drawing-action-button"
                        onClick={
                          viewDrawingFullscreen
                        }
                      >

                        ⛶

                        View Full Screen

                      </button>

                      <button
                        className="drawing-action-button"
                        onClick={
                          downloadDrawingPPTX
                        }
                      >

                        ↓

                        Download PPTX

                      </button>

                      <button
                        className="drawing-action-button"
                        onClick={
                          downloadDrawingXML
                        }
                      >
                        
                        ↓
                        Export XML

                      </button>

                    </div>

                  </div>

                  <div
                    id="ai-drawing"
                    className="ai-drawing"
                    dangerouslySetInnerHTML={{
                      __html:
                        drawingSVG,
                    }}
                  />

                </div>

              </div>

            </section>
          )}

        {/* =================================================
            FEATURE CARDS
        ================================================= */}

        <section className="features">

          <div className="feature-card">

            <div className="feature-icon">
              <WaveIcon />
            </div>

            <div>

              <h3>
                Speech Recognition
              </h3>

              <p>
                Advanced AI Speech recognition
              </p>

            </div>

          </div>

          <div className="feature-card">

            <div className="feature-icon language-feature">
              <LanguageIcon />
            </div>

            <div>

              <h3>
                Multi-Language
              </h3>

              <p>
                Supports 100+ Languages
              </p>

            </div>

          </div>

          <div className="feature-card">

            <div className="feature-icon sparkle-feature">
              <SparkleIcon />
            </div>

            <div>

              <h3>
                Fast Translation
              </h3>

              <p>
                Instant, Accurate and Reliable
              </p>

            </div>

          </div>

        </section>
        </>
  )}

        {/* =================================================
            BPMN TABS
        ================================================= */}

        {activeTab === "bpmn" && (
          <BpmnEditor bpmnXml={bpmnXml} />
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer>

          <span>
            ◆
          </span>

          Powered by Gemini

          <b>
            |
          </b>

          Developed by Srinivas

        </footer>

      </main>

    </div>
  );
}

export default App;