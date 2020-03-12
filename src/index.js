import React from "react";
import Stage from "./components/Stage/Stage";
import Node from "./components/Node/Node";
import Connections from "./components/Connections/Connections";
import {
  NodeTypesContext,
  InputTypesContext,
  NodeDispatchContext,
  ConnectionRecalculateContext,
  ContextContext
} from "./context";
import { createConnections } from "./connectionCalculator";
import nodesReducer, { connectNodesReducer, getInitialNodes } from "./nodesReducer";

import styles from "./styles.css";

const NodeEditor = ({ nodes: initialNodes, nodeTypes, inputTypes, defaultNodes=[], context={} }, ref) => {
  const [nodes, dispatchNodes] = React.useReducer(
    connectNodesReducer(nodesReducer, { nodeTypes, inputTypes }),
    getInitialNodes(initialNodes, defaultNodes, nodeTypes, inputTypes)
  );
  const stage = React.useRef();
  const [
    shouldRecalculateConnections,
    setShouldRecalculateConnections
  ] = React.useState(true);

  const recalculateConnections = React.useCallback(() => {
    createConnections(nodes);
  }, [nodes]);

  React.useLayoutEffect(() => {
    if (shouldRecalculateConnections) {
      recalculateConnections();
      setShouldRecalculateConnections(false);
    }
  }, [shouldRecalculateConnections, recalculateConnections]);

  const triggerRecalculation = () => {
    setShouldRecalculateConnections(true);
  };

  React.useImperativeHandle(ref, () => ({
    getNodes: () => {
      return nodes;
    }
  }));

  return (
    <InputTypesContext.Provider value={inputTypes}>
      <NodeTypesContext.Provider value={nodeTypes}>
        <NodeDispatchContext.Provider value={dispatchNodes}>
          <ConnectionRecalculateContext.Provider value={triggerRecalculation}>
            <ContextContext.Provider value={context}>
              <Stage stageRef={stage}>
                {Object.values(nodes).map(node => (
                  <Node
                    stageRef={stage}
                    onDragEnd={triggerRecalculation}
                    {...node}
                    key={node.id}
                  />
                ))}
                <Connections nodes={nodes} />
                <div
                  className={styles.dragWrapper}
                  id="__node_editor_drag_connection__"
                ></div>
              </Stage>
            </ContextContext.Provider>
          </ConnectionRecalculateContext.Provider>
        </NodeDispatchContext.Provider>
      </NodeTypesContext.Provider>
    </InputTypesContext.Provider>
  );
};

export default React.forwardRef(NodeEditor);
