import React, { useEffect, useRef, useState } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from
 "bpmn-js-properties-panel";

import "@bpmn-io/properties-panel/dist/assets/properties-panel.css";
import "./BpmnEditor.css";

const EMPTY_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn">

  <bpmn:process
    id="Process_1"
    isExecutable="false">

    <bpmn:startEvent
      id="StartEvent_1"
      name="Start" />

  </bpmn:process>

  <bpmndi:BPMNDiagram
    id="BPMNDiagram_1">

    <bpmndi:BPMNPlane
      id="BPMNPlane_1"
      bpmnElement="Process_1">

      <bpmndi:BPMNShape
        id="StartEvent_1_di"
        bpmnElement="StartEvent_1">

        <dc:Bounds
          x="200"
          y="150"
          width="36"
          height="36" />

      </bpmndi:BPMNShape>

    </bpmndi:BPMNPlane>

  </bpmndi:BPMNDiagram>

</bpmn:definitions>
`;

function BpmnEditor({bpmnXml}) {
  const canvasRef = useRef(null);
  const modelerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Ready");

  const [validationResult, setValidationResult] = useState(null);
  const [xmlPreview, setXmlPreview] = useState("");
  const [showXmlPreview, setShowXmlPreview] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentationResult, setDocumentationResult] = useState(null);
  const [isDocumenting, setIsDocumenting] = useState(false);

  useEffect(() => {
  if (!canvasRef.current) {
    return;
  }

  let cancelled = false;

  const modeler = new BpmnModeler({
    container: canvasRef.current,

    propertiesPanel: {
      parent: "#bpmn-properties-panel",
    },

    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
    ],
  });

  modelerRef.current = modeler;

  const initialize = async () => {
    try {
      await modeler.importXML(EMPTY_BPMN);

      // React may have already cleaned up this effect.
      if (cancelled) {
        return;
      }

      const canvas = modeler.get("canvas");

      canvas.zoom("fit-viewport");

      setIsReady(true);
      setStatus("BPMN Editor Ready");
    } catch (err) {
      // Ignore errors from an effect that React has already cancelled.
      if (cancelled) {
        return;
      }

      console.error("BPMN initialization error:", err);

      setError(
        err.message ||
          "Could not initialize the BPMN editor."
      );
    }
  };

  initialize();

  return () => {
    cancelled = true;

    modeler.destroy();

    if (modelerRef.current === modeler) {
      modelerRef.current = null;
    }
  };
  }, []);


    // =========================================================
    // IMPORT BPMN XML FROM VOXAAI
    // =========================================================

    const importBpmnXml = async (xml) => {
    if (!xml) {
        return;
    }

    setError("");
    setStatus("Loading AI-generated BPMN...");

    try {
        if (!modelerRef.current) {
        throw new Error(
            "BPMN editor is not ready."
        );
        }

        await modelerRef.current.importXML(xml);

        const canvas =
        modelerRef.current.get("canvas");

        canvas.zoom("fit-viewport");

        setStatus(
        "AI-generated BPMN loaded"
        );
    } catch (err) {
        console.error(
        "AI BPMN import error:",
        err
        );

        setError(
        err.message ||
            "The AI-generated BPMN could not be loaded."
        );

        setStatus(
        "AI BPMN import failed"
        );
    }
    };

    // =========================================================
    // LOAD AI-GENERATED BPMN
    // =========================================================

    useEffect(() => {
        if (!bpmnXml || !isReady) {
            return;
        }

        importBpmnXml(bpmnXml);
        }, [bpmnXml, isReady]);

  // =========================================================
  // IMPORT BPMN XML
  // =========================================================

  const importBpmnFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setStatus("Importing BPMN...");

    try {
      const xml = await file.text();

      if (!modelerRef.current) {
        throw new Error("BPMN editor is not ready.");
      }

      await modelerRef.current.importXML(xml);

      const canvas = modelerRef.current.get("canvas");

      canvas.zoom("fit-viewport");

      setStatus(`Imported: ${file.name}`);
    } catch (err) {
      console.error("BPMN import error:", err);

      setError(
        err.message ||
          "The selected file could not be imported."
      );

      setStatus("Import failed");
    }

    event.target.value = "";
  };

  // =========================================================
  // NEW BPMN DIAGRAM
  // =========================================================

  const createNewDiagram = async () => {
    setError("");
    setStatus("Creating new diagram...");

    try {
      if (!modelerRef.current) {
        throw new Error("BPMN editor is not ready.");
      }

      await modelerRef.current.importXML(EMPTY_BPMN);

      const canvas = modelerRef.current.get("canvas");

      canvas.zoom("fit-viewport");

      setStatus("New BPMN diagram");
    } catch (err) {
      console.error("New BPMN diagram error:", err);

      setError(
        err.message ||
          "Could not create a new BPMN diagram."
      );

      setStatus("Failed");
    }
  };

  // =========================================================
  // EXPORT BPMN AS SVG
  // =========================================================

  const downloadBpmnSvg = async () => {
    setError("");
    setStatus("Generating BPMN SVG...");

    try {
      if (!modelerRef.current) {
        throw new Error("BPMN editor is not ready.");
      }

      const result =
        await modelerRef.current.saveSVG();

      const svg = result.svg;

      const blob = new Blob(
        [svg],
        {
          type: "image/svg+xml;charset=utf-8",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        "voxaai-bpmn-diagram.svg";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setStatus("BPMN SVG downloaded");
    } catch (err) {
      console.error(
        "BPMN SVG export error:",
        err
      );

      setError(
        err.message ||
          "Could not export BPMN SVG."
      );

      setStatus("SVG export failed");
    }
  };

  // =========================================================
  // EXPORT BPMN AS PNG
  // =========================================================

  const downloadBpmnPng = async () => {
    setError("");
    setStatus("Generating BPMN PNG...");

    try {
      if (!modelerRef.current) {
        throw new Error("BPMN editor is not ready.");
      }

      const result =
        await modelerRef.current.saveSVG();

      const svg = result.svg;

      const parser =
        new DOMParser();

      const svgDocument =
        parser.parseFromString(
          svg,
          "image/svg+xml"
        );

      const svgElement =
        svgDocument.documentElement;

      const viewBox =
        svgElement.getAttribute("viewBox");

      let width =
        parseFloat(
          svgElement.getAttribute("width")
        );

      let height =
        parseFloat(
          svgElement.getAttribute("height")
        );

      if (
        (!width || !height) &&
        viewBox
      ) {
        const values =
          viewBox
            .split(/\s+/)
            .map(Number);

        width = values[2];
        height = values[3];
      }

      if (!width || !height) {
        width = 1600;
        height = 900;
      }

      const scale = 2;

      const canvas =
        document.createElement("canvas");

      canvas.width =
        width * scale;

      canvas.height =
        height * scale;

      const context =
        canvas.getContext("2d");

      context.fillStyle = "#ffffff";

      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const svgBlob =
        new Blob(
          [svg],
          {
            type: "image/svg+xml;charset=utf-8",
          }
        );

      const svgUrl =
        URL.createObjectURL(svgBlob);

      const image =
        new Image();

      image.onload = () => {
        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        URL.revokeObjectURL(svgUrl);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setStatus("PNG export failed");
              return;
            }

            const pngUrl =
              URL.createObjectURL(blob);

            const link =
              document.createElement("a");

            link.href = pngUrl;
            link.download =
              "voxaai-bpmn-diagram.png";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(pngUrl);

            setStatus("BPMN PNG downloaded");
          },
          "image/png"
        );
      };

      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);

        throw new Error(
          "Could not convert BPMN SVG to PNG."
        );
      };

      image.src = svgUrl;

    } catch (err) {
      console.error(
        "BPMN PNG export error:",
        err
      );

      setError(
        err.message ||
          "Could not export BPMN PNG."
      );

      setStatus("PNG export failed");
    }
  };

  // =========================================================
  // EXPORT BPMN XML
  // =========================================================

  const downloadBpmnXml = async () => {
    setError("");

    try {
      if (!modelerRef.current) {
        throw new Error("BPMN editor is not ready.");
      }

      const result =
        await modelerRef.current.saveXML({
          format: true,
        });

      const xml = result.xml;

      const blob = new Blob(
        [xml],
        {
          type: "application/xml;charset=utf-8",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        "voxaai-bpmn-diagram.bpmn";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setStatus("BPMN XML downloaded");
    } catch (err) {
      console.error("BPMN export error:", err);

      setError(
        err.message ||
          "Could not export BPMN XML."
      );

      setStatus("Export failed");
    }
  };

  // =========================================================
  // FIT CANVAS
  // =========================================================

  const fitCanvas = () => {
    if (!modelerRef.current) {
      return;
    }

    const canvas =
      modelerRef.current.get("canvas");

    canvas.zoom("fit-viewport");

    setStatus("Canvas fitted");
  };

  // =========================================================
  // ZOOM IN
  // =========================================================

  const zoomIn = () => {
    if (!modelerRef.current) {
      return;
    }

    const canvas =
      modelerRef.current.get("canvas");

    const currentZoom = canvas.zoom();

    canvas.zoom(
      Math.min(currentZoom + 0.1, 2)
    );

    setStatus("Zoomed in");
  };

  // =========================================================
  // ZOOM OUT
  // =========================================================

  const zoomOut = () => {
    if (!modelerRef.current) {
      return;
    }

    const canvas =
      modelerRef.current.get("canvas");

    const currentZoom = canvas.zoom();

    canvas.zoom(
      Math.max(currentZoom - 0.1, 0.2)
    );

    setStatus("Zoomed out");
  };

  // =========================================================
  // RESET ZOOM
  // =========================================================

  const resetZoom = () => {
    if (!modelerRef.current) {
      return;
    }

    const canvas =
      modelerRef.current.get("canvas");

    canvas.zoom(1);

    setStatus("Zoom reset");
  };

  // =========================================================
  // EDIT SELECTED ELEMENT LABEL
  // =========================================================

  const editSelectedLabel = () => {
    if (!modelerRef.current) {
      return;
    }

    const selection =
      modelerRef.current.get("selection");

    const selectedElements =
      selection.get();

    if (!selectedElements.length) {
      setStatus("Select an element first");
      return;
    }

    const element = selectedElements[0];

    const modeling =
      modelerRef.current.get("modeling");

    const currentLabel =
      element.businessObject.name || "";

    const newLabel =
      window.prompt(
        "Enter BPMN element name:",
        currentLabel
      );

    if (newLabel === null) {
      return;
    }

    modeling.updateLabel(
      element,
      newLabel.trim()
    );

    setStatus("Element label updated");
  };

  // =========================================================
  // DELETE SELECTED ELEMENT
  // =========================================================

  const deleteSelectedElement = () => {
    if (!modelerRef.current) {
      return;
    }

    const selection =
      modelerRef.current.get("selection");

    const selectedElements =
      selection.get();

    if (!selectedElements.length) {
      setStatus("Select an element first");
      return;
    }

    const modeling =
      modelerRef.current.get("modeling");

    modeling.removeElements(
      selectedElements
    );

    setStatus("Element deleted");
  };

  // =========================================================
  // UNDO
  // =========================================================

  const undo = () => {
    if (!modelerRef.current) {
      return;
    }

    const commandStack =
      modelerRef.current.get("commandStack");

    if (commandStack.canUndo()) {
      commandStack.undo();
      setStatus("Undo");
    }
  };

  // =========================================================
  // REDO
  // =========================================================

  const redo = () => {
    if (!modelerRef.current) {
      return;
    }

    const commandStack =
      modelerRef.current.get("commandStack");

    if (commandStack.canRedo()) {
      commandStack.redo();
      setStatus("Redo");
    }
  };

    // =========================================================
    // VALIDATE BPMN DIAGRAM
    // =========================================================

    const validateBpmn = () => {
    setError("");
    setStatus("Validating BPMN workflow...");

    try {
      if (!modelerRef.current) {
        throw new Error("BPMN editor is not ready.");
      }

      const elementRegistry =
        modelerRef.current.get("elementRegistry");

      const elements = elementRegistry.getAll();

      // bpmn-js type checking must be done on businessObject
      const isType = (element, type) =>
        Boolean(
          element?.businessObject?.$instanceOf?.(type)
        );

      const flowNodes = elements.filter(
        (element) =>
          isType(element, "bpmn:FlowNode") &&
          !element.labelTarget
      );

      const sequenceFlows = elements.filter(
        (element) =>
          isType(element, "bpmn:SequenceFlow") &&
          !element.labelTarget
      );

      const errors = [];
      const warnings = [];

      const startEvents = flowNodes.filter(
        (node) =>
          isType(node, "bpmn:StartEvent")
      );

      const endEvents = flowNodes.filter(
        (node) =>
          isType(node, "bpmn:EndEvent")
      );

      const gateways = flowNodes.filter(
        (node) =>
          isType(node, "bpmn:Gateway")
      );

      const activities = flowNodes.filter(
        (node) =>
          isType(node, "bpmn:Activity")
      );

      // -----------------------------------------
      // BASIC STRUCTURE
      // -----------------------------------------

      if (startEvents.length === 0) {
        errors.push(
          "No start event was found."
        );
      }

      if (endEvents.length === 0) {
        errors.push(
          "No end event was found."
        );
      }

      if (startEvents.length > 1) {
        warnings.push(
          `Multiple start events detected (${startEvents.length}).`
        );
      }

      if (endEvents.length > 1) {
        warnings.push(
          `Multiple end events detected (${endEvents.length}).`
        );
      }

      // -----------------------------------------
      // SEQUENCE FLOW VALIDATION
      // -----------------------------------------

      sequenceFlows.forEach((flow) => {
        if (!flow.source) {
          errors.push(
            `Sequence flow "${flow.id}" has no source.`
          );
        }

        if (!flow.target) {
          errors.push(
            `Sequence flow "${flow.id}" has no target.`
          );
        }
      });

      // -----------------------------------------
      // NODE CONNECTIVITY
      // -----------------------------------------

      flowNodes.forEach((node) => {
        const incoming = sequenceFlows.filter(
          (flow) =>
            flow.target?.id === node.id
        );

        const outgoing = sequenceFlows.filter(
          (flow) =>
            flow.source?.id === node.id
        );

        const nodeName =
          node.businessObject?.name ||
          node.id;

        // Start Event
        if (isType(node, "bpmn:StartEvent")) {
          if (outgoing.length === 0) {
            errors.push(
              `Start event "${nodeName}" has no outgoing sequence flow.`
            );
          }
        }

        // End Event
        else if (isType(node, "bpmn:EndEvent")) {
          if (incoming.length === 0) {
            errors.push(
              `End event "${nodeName}" has no incoming sequence flow.`
            );
          }
        }

        // Gateway
        else if (isType(node, "bpmn:Gateway")) {
          if (incoming.length === 0) {
            errors.push(
              `Gateway "${nodeName}" has no incoming sequence flow.`
            );
          }

          if (outgoing.length === 0) {
            errors.push(
              `Gateway "${nodeName}" has no outgoing sequence flow.`
            );
          }
        }

        // Activity / Task
        else if (isType(node, "bpmn:Activity")) {
          if (incoming.length === 0) {
            errors.push(
              `Activity "${nodeName}" has no incoming sequence flow.`
            );
          }

          if (outgoing.length === 0) {
            errors.push(
              `Activity "${nodeName}" has no outgoing sequence flow.`
            );
          }
        }
      });

      // -----------------------------------------
      // BUILD WORKFLOW GRAPH
      // -----------------------------------------

      const graph = new Map();

      flowNodes.forEach((node) => {
        graph.set(node.id, []);
      });

      sequenceFlows.forEach((flow) => {
        if (
          flow.source &&
          flow.target &&
          graph.has(flow.source.id)
        ) {
          graph
            .get(flow.source.id)
            .push(flow.target.id);
        }
      });

      // -----------------------------------------
      // FIND REACHABLE NODES
      // -----------------------------------------

      const reachable = new Set();

      const queue = startEvents.map(
        (event) => event.id
      );

      while (queue.length > 0) {
        const currentId = queue.shift();

        if (reachable.has(currentId)) {
          continue;
        }

        reachable.add(currentId);

        const nextNodes =
          graph.get(currentId) || [];

        nextNodes.forEach((nextId) => {
          if (!reachable.has(nextId)) {
            queue.push(nextId);
          }
        });
      }

      // -----------------------------------------
      // UNREACHABLE ELEMENTS
      // -----------------------------------------

      flowNodes.forEach((node) => {
        if (!reachable.has(node.id)) {
          const nodeName =
            node.businessObject?.name ||
            node.id;

          errors.push(
            `Unreachable element detected: "${nodeName}".`
          );
        }
      });

      // -----------------------------------------
      // END EVENT REACHABILITY
      // -----------------------------------------

      const reachableEndEvents =
        endEvents.filter((event) =>
          reachable.has(event.id)
        );

      if (
        startEvents.length > 0 &&
        endEvents.length > 0 &&
        reachableEndEvents.length === 0
      ) {
        errors.push(
          "The workflow cannot reach any end event from the start event."
        );
      }

      // -----------------------------------------
      // DEAD-END DETECTION
      // -----------------------------------------

      flowNodes.forEach((node) => {
        if (
          !reachable.has(node.id) ||
          isType(node, "bpmn:EndEvent")
        ) {
          return;
        }

        const outgoing =
          graph.get(node.id) || [];

        if (outgoing.length === 0) {
          const nodeName =
            node.businessObject?.name ||
            node.id;

          errors.push(
            `Dead-end path detected at "${nodeName}".`
          );
        }
      });

      // -----------------------------------------
      // DISCONNECTED COMPONENTS
      // -----------------------------------------

      const disconnectedNodes =
        flowNodes.filter(
          (node) => !reachable.has(node.id)
        );

      if (disconnectedNodes.length > 0) {
        warnings.push(
          `${disconnectedNodes.length} element(s) are disconnected from the main workflow.`
        );
      }

      // -----------------------------------------
      // GATEWAY QUALITY CHECK
      // -----------------------------------------

      gateways.forEach((gateway) => {
        const incoming =
          sequenceFlows.filter(
            (flow) =>
              flow.target?.id === gateway.id
          );

        const outgoing =
          sequenceFlows.filter(
            (flow) =>
              flow.source?.id === gateway.id
          );

        const name =
          gateway.businessObject?.name ||
          gateway.id;

        if (
          outgoing.length === 1 &&
          isType(
            gateway,
            "bpmn:ExclusiveGateway"
          )
        ) {
          warnings.push(
            `Exclusive gateway "${name}" has only one outgoing path.`
          );
        }

        if (
          incoming.length === 1 &&
          outgoing.length === 1
        ) {
          warnings.push(
            `Gateway "${name}" does not create or merge multiple paths.`
          );
        }
      });

      // -----------------------------------------
      // FINAL RESULT
      // -----------------------------------------

      const isValid =
        errors.length === 0;

      setValidationResult({
        valid: isValid,
        errors,
        warnings,
        stats: {
          flowNodes: flowNodes.length,
          activities: activities.length,
          gateways: gateways.length,
          startEvents: startEvents.length,
          endEvents: endEvents.length,
          sequenceFlows: sequenceFlows.length,
          reachableNodes: reachable.size,
        },
      });

      if (isValid) {
        setStatus(
          warnings.length > 0
            ? "BPMN validation passed with warnings"
            : "BPMN validation passed"
        );
      } else {
        setStatus(
          `BPMN validation found ${errors.length} issue(s)`
        );
      }

    } catch (err) {
      console.error(
        "BPMN validation error:",
        err
      );

      setError(
        err.message ||
          "Could not validate the BPMN workflow."
      );

      setStatus("Validation failed");
    }
  };

    // =========================================================
    // AI WORKFLOW ANALYSIS
    // =========================================================

    const analyzeBpmn = async () => {
      setError("");
      setAnalysisResult(null);
      setIsAnalyzing(true);
      setStatus("Analyzing BPMN with AI...");

      try {
        if (!modelerRef.current) {
          throw new Error("BPMN editor is not ready.");
        }

        // -----------------------------------------------------
        // GET CURRENT BPMN XML
        // -----------------------------------------------------

        const result =
          await modelerRef.current.saveXML({
            format: true,
          });

        const xml = result.xml;

        // -----------------------------------------------------
        // SEND BPMN TO VOXAAI BACKEND
        // -----------------------------------------------------

        const response = await fetch(
          "http://127.0.0.1:5000/analyze-bpmn",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              bpmn_xml: xml,
            }),
          }
        );

        const data = await response.json();

        // -----------------------------------------------------
        // HANDLE BACKEND ERROR
        // -----------------------------------------------------

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Could not analyze the BPMN workflow."
          );
        }

        // -----------------------------------------------------
        // STORE AI ANALYSIS
        // -----------------------------------------------------

        setAnalysisResult(data);

        setStatus(
          "AI Workflow Analysis Complete"
        );

      } catch (err) {

        console.error(
          "AI BPMN analysis error:",
          err
        );

        setError(
          err.message ||
            "Could not analyze the BPMN workflow."
        );

        setStatus(
          "AI analysis failed"
        );

      } finally {

        setIsAnalyzing(false);

      }
    };

    // =========================================================
    // AI BPMN DOCUMENTATION
    // =========================================================

    const generateBpmnDocumentation = async () => {
    setError("");
    setDocumentationResult(null);
    setIsDocumenting(true);
    setStatus("Generating BPMN documentation...");

    try {
      if (!modelerRef.current) {
        throw new Error("BPMN editor is not ready.");
      }

      const result =
        await modelerRef.current.saveXML({
          format: true,
        });

      const xml = result.xml;

      const response = await fetch(
        "http://127.0.0.1:5000/document-bpmn",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bpmn_xml: xml,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Could not generate BPMN documentation."
        );
      }

      setDocumentationResult(data);
      setStatus("AI Documentation Generated");
    } catch (err) {
      console.error(
        "BPMN documentation error:",
        err
      );

      setError(
        err.message ||
          "Could not generate BPMN documentation."
      );

      setStatus("Documentation generation failed");
    } finally {
      setIsDocumenting(false);
    }
  };

    // =========================================================
    // PREVIEW BPMN XML
    // =========================================================

    const previewBpmnXml = async () => {
      setError("");
      setStatus("Generating BPMN XML preview...");

      try {
        if (!modelerRef.current) {
          throw new Error("BPMN editor is not ready.");
        }

        const result =
          await modelerRef.current.saveXML({
            format: true,
          });

        setXmlPreview(result.xml);
        setShowXmlPreview(true);

        setStatus("BPMN XML preview ready");
      } catch (err) {
        console.error(
          "BPMN XML preview error:",
          err
        );

        setError(
          err.message ||
            "Could not generate BPMN XML preview."
        );

        setStatus("XML preview failed");
      }
    };

    // =========================================================
    // COPY BPMN XML
    // =========================================================

    const copyBpmnXml = async () => {
      if (!xmlPreview) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          xmlPreview
        );

        setStatus("BPMN XML copied");
      } catch (err) {
        console.error(
          "BPMN XML copy error:",
          err
        );

        setStatus("Could not copy BPMN XML");
      }
    };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="bpmn-editor-section">

      <div className="bpmn-editor-header">

        <div className="bpmn-editor-heading">

          <div className="bpmn-editor-icon">
            ◇
          </div>

          <div>
            <h2>
              BPMN Editor
            </h2>

            <p>
              Create, edit and export BPMN 2.0 process diagrams
            </p>
          </div>

        </div>

        <div className="bpmn-status">

          <span
            className={
              isReady
                ? "bpmn-status-dot ready"
                : "bpmn-status-dot"
            }
          />

          {status}

        </div>

      </div>


      <div className="bpmn-toolbar">

        <button
          className="bpmn-toolbar-button"
          onClick={createNewDiagram}
          disabled={!isReady}
        >
          ＋ New Diagram
        </button>
        
        <button
            className="bpmn-toolbar-button"
            onClick={undo}
            disabled={!isReady}
        >
            ↶ Undo
        </button>

        <button
            className="bpmn-toolbar-button"
            onClick={redo}
            disabled={!isReady}
        >
            ↷ Redo
        </button>

        <button
            className="bpmn-toolbar-button"
            onClick={editSelectedLabel}
            disabled={!isReady}
            title="Edit selected element"
        >
            ✏ Edit
        </button>

        <button
            className="bpmn-toolbar-button"
            onClick={deleteSelectedElement}
            disabled={!isReady}
            title="Delete selected element"
        >
            🗑 Delete
        </button>

        <button
            className="bpmn-toolbar-button"
            onClick={validateBpmn}
            disabled={!isReady}
            title="Validate BPMN diagram"
        >
            ✓ Validate
        </button>

        <button
            className="bpmn-toolbar-button"
            onClick={analyzeBpmn}
            disabled={!isReady || isAnalyzing}
            title="Analyze BPMN workflow with AI"
        >
            {isAnalyzing
              ? "◌ Analyzing..."
              : "🧠 AI Analyze"}
        </button>

        <button
          className="bpmn-toolbar-button"
          onClick={generateBpmnDocumentation}
          disabled={!isReady || isDocumenting}
          title="Generate AI documentation for this BPMN workflow"
        >
          {isDocumenting
            ? "◌ Documenting..."
            : "📝 AI Documentation"}
        </button>

        <button
          className="bpmn-toolbar-button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={!isReady}
        >
          ↑ Import BPMN
        </button>


        <input
          ref={fileInputRef}
          type="file"
          accept=".bpmn,.xml"
          onChange={importBpmnFile}
          hidden
        />


        <div className="bpmn-zoom-controls">

            <button
                className="bpmn-toolbar-button"
                onClick={zoomOut}
                disabled={!isReady}
                title="Zoom Out"
            >
                −
            </button>

            <button
                className="bpmn-toolbar-button"
                onClick={resetZoom}
                disabled={!isReady}
                title="Reset Zoom"
            >
                100%
            </button>

            <button
                className="bpmn-toolbar-button"
                onClick={zoomIn}
                disabled={!isReady}
                title="Zoom In"
            >
                ＋
            </button>

            <button
                className="bpmn-toolbar-button"
                onClick={fitCanvas}
                disabled={!isReady}
                title="Fit Diagram"
            >
                ⛶ Fit
            </button>

            </div>


            <button
              className="bpmn-toolbar-button"
              onClick={previewBpmnXml}
              disabled={!isReady}
            >
              ◉ Preview XML
            </button>

            <button
              className="bpmn-toolbar-button"
              onClick={downloadBpmnSvg}
              disabled={!isReady}
            >
              ↓ SVG
            </button>

            <button
              className="bpmn-toolbar-button"
              onClick={downloadBpmnPng}
              disabled={!isReady}
            >
              ↓ PNG
            </button>

            <button
              className="bpmn-toolbar-button primary"
              onClick={downloadBpmnXml}
              disabled={!isReady}
            >
              ↓ Export BPMN XML
            </button>

      </div>


      {error && (
        <div className="bpmn-error">
          <strong>!</strong>
          <span>{error}</span>
        </div>
      )}

      {validationResult && (
        <div
            className={
            validationResult.valid
                ? "bpmn-validation success"
                : "bpmn-validation failed"
            }
        >
            <div className="bpmn-validation-header">
            <strong>
                {validationResult.valid ? "✓" : "!"}
            </strong>

            <span>
                {validationResult.valid
                ? "BPMN Validation Passed"
                : "BPMN Validation Failed"}
            </span>
            </div>

            {validationResult.errors.length > 0 && (
            <div className="bpmn-validation-section">
                <strong>Errors</strong>

                <ul>
                {validationResult.errors.map(
                    (message, index) => (
                    <li key={index}>
                        {message}
                    </li>
                    )
                )}
                </ul>
            </div>
            )}

            {validationResult.warnings.length > 0 && (
            <div className="bpmn-validation-section warnings">
                <strong>Warnings</strong>

                <ul>
                {validationResult.warnings.map(
                    (message, index) => (
                    <li key={index}>
                        {message}
                    </li>
                    )
                )}
                </ul>
            </div>
            )}

            {validationResult.valid &&
            validationResult.warnings.length === 0 && (
                <p className="bpmn-validation-message">
                The BPMN diagram passed the structural
                validation checks.
                </p>
            )}
        </div>
        )}

      {analysisResult && (
        <div className="bpmn-ai-analysis">

          <div className="bpmn-ai-analysis-header">

            <div>
              <h3>
                🧠 AI Workflow Analysis
              </h3>

              <p>
                AI-generated insights from the current BPMN process
              </p>
            </div>

            <button
              className="bpmn-ai-analysis-close"
              onClick={() =>
                setAnalysisResult(null)
              }
              title="Close analysis"
            >
              ×
            </button>

          </div>


          {/* SUMMARY */}

          <div className="bpmn-ai-analysis-summary">

            <h4>
              Process Summary
            </h4>

            <p>
              {analysisResult.summary}
            </p>

          </div>


          <div className="bpmn-ai-analysis-grid">

            {/* STRENGTHS */}

            <div className="bpmn-ai-analysis-card">

              <h4>
                ✓ Strengths
              </h4>

              {analysisResult.strengths?.length > 0 ? (

                <ul>
                  {analysisResult.strengths.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>

              ) : (

                <p>
                  No significant strengths identified.
                </p>

              )}

            </div>


            {/* ISSUES */}

            <div className="bpmn-ai-analysis-card">

              <h4>
                ⚠ Issues
              </h4>

              {analysisResult.issues?.length > 0 ? (

                <ul>
                  {analysisResult.issues.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>

              ) : (

                <p>
                  No significant issues identified.
                </p>

              )}

            </div>


            {/* AUTOMATION */}

            <div className="bpmn-ai-analysis-card">

              <h4>
                🤖 Automation Opportunities
              </h4>

              {analysisResult.automation_opportunities?.length > 0 ? (

                <ul>
                  {analysisResult.automation_opportunities.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>

              ) : (

                <p>
                  No clear automation opportunities identified.
                </p>

              )}

            </div>


            {/* RECOMMENDATIONS */}

            <div className="bpmn-ai-analysis-card">

              <h4>
                💡 Recommendations
              </h4>

              {analysisResult.recommendations?.length > 0 ? (

                <ul>
                  {analysisResult.recommendations.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>

              ) : (

                <p>
                  No additional recommendations.
                </p>

              )}

            </div>

          </div>

        </div>
      )}

      {documentationResult && (
        <section className="bpmn-ai-documentation">
          <div className="bpmn-ai-documentation-header">
            <div>
              <h3>📝 AI Workflow Documentation</h3>
              <p>
                Professional documentation generated from
                the current BPMN workflow.
              </p>
            </div>

            <button
              className="bpmn-ai-documentation-close"
              onClick={() =>
                setDocumentationResult(null)
              }
              title="Close documentation"
            >
              ×
            </button>
          </div>

          <div className="bpmn-documentation-section">
            <h4>Process Overview</h4>

            <p>
              {documentationResult.process_overview}
            </p>
          </div>

          <div className="bpmn-documentation-grid">

            <div className="bpmn-documentation-card">
              <h4>Workflow Steps</h4>

              <ol>
                {documentationResult.workflow_steps?.map(
                  (step, index) => (
                    <li key={index}>
                      {step}
                    </li>
                  )
                )}
              </ol>
            </div>

            <div className="bpmn-documentation-card">
              <h4>Business Rules</h4>

              <ul>
                {documentationResult.business_rules?.map(
                  (rule, index) => (
                    <li key={index}>
                      {rule}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="bpmn-documentation-card">
              <h4>Key Decisions</h4>

              <ul>
                {documentationResult.key_decisions?.map(
                  (decision, index) => (
                    <li key={index}>
                      {decision}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="bpmn-documentation-card">
              <h4>Roles & Responsibilities</h4>

              <ul>
                {documentationResult.roles_responsibilities?.map(
                  (role, index) => (
                    <li key={index}>
                      {role}
                    </li>
                  )
                )}
              </ul>
            </div>

          </div>
        </section>
      )}
      
      <div className="bpmn-workspace">
        <div
            ref={canvasRef}
            className="bpmn-canvas"
        />

        <aside
            id="bpmn-properties-panel"
            className="bpmn-properties-panel"
        />
        </div>

      {showXmlPreview && (
        <div className="bpmn-xml-modal-overlay">
          <div className="bpmn-xml-modal">

            <div className="bpmn-xml-modal-header">
              <div>
                <h3>BPMN XML Preview</h3>
                <p>
                  BPMN 2.0 XML generated from the current diagram
                </p>
              </div>

              <button
                className="bpmn-xml-close"
                onClick={() =>
                  setShowXmlPreview(false)
                }
                title="Close"
              >
                ×
              </button>
            </div>

            <div className="bpmn-xml-editor">
              <pre>
                <code>{xmlPreview}</code>
              </pre>
            </div>

            <div className="bpmn-xml-modal-footer">

              <span>
                {xmlPreview.length.toLocaleString()} characters
              </span>

              <div className="bpmn-xml-actions">

                <button
                  className="bpmn-toolbar-button"
                  onClick={copyBpmnXml}
                >
                  📋 Copy XML
                </button>

                <button
                  className="bpmn-toolbar-button primary"
                  onClick={downloadBpmnXml}
                >
                  ↓ Download XML
                </button>

              </div>

            </div>

          </div>
        </div>
      )}


      <div className="bpmn-editor-footer">

        <span>
          BPMN 2.0 Modeling
        </span>

        <span>
          •
        </span>

        <span>
          Editable Process Diagram
        </span>

        <span>
          •
        </span>

        <span>
          XML Export
        </span>

      </div>

    </section>
  );
}

export default BpmnEditor;