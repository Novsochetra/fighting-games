// Tarjan's strongly connected components: modules that import each other in a cycle form one
// component. Components come out dependencies first, so each one's imports are already done
export function strongComponents(graph) {
  const state = { next: 0, index: new Map(), low: new Map(), stack: [], onStack: new Set() };
  const components = [];
  for (const node of graph.keys()) {
    if (!state.index.has(node)) {
      visit(node, graph, state, components);
    }
  }
  return components;
}

function visit(node, graph, state, components) {
  state.index.set(node, state.next);
  state.low.set(node, state.next);
  state.next += 1;
  state.stack.push(node);
  state.onStack.add(node);
  for (const next of graph.get(node).filter((dependency) => graph.has(dependency))) {
    if (!state.index.has(next)) {
      visit(next, graph, state, components);
      state.low.set(node, Math.min(state.low.get(node), state.low.get(next)));
    } else if (state.onStack.has(next)) {
      state.low.set(node, Math.min(state.low.get(node), state.index.get(next)));
    }
  }
  if (state.low.get(node) === state.index.get(node)) {
    components.push(popComponent(node, state));
  }
}

function popComponent(root, state) {
  const component = [];
  let node;
  do {
    node = state.stack.pop();
    state.onStack.delete(node);
    component.push(node);
  } while (node !== root);
  return component;
}
