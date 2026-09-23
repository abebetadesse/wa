import type { Core } from "./HexacoreEngine";

export type Depth = 0 | 1 | 2 | 3 | 4;
export type CorrespondenceKey = "planet" | "herb" | "sound" | "geometry" | "body" | "day";

export type DepthState = {
  depth: Depth;
  path: {
    core?: Core;
    aspectCode?: string;
    frequencyLevel?: number;
    archetypeId?: string;
    correspondenceKey?: CorrespondenceKey;
  };
};

export const INITIAL_DEPTH_STATE: DepthState = { depth: 0, path: {} };

export function descend(state: DepthState, key: string): DepthState {
  if (state.depth === 0 && ["P", "H", "C", "E", "S", "O"].includes(key)) {
    return { depth: 1, path: { core: key as Core } };
  }
  if (state.depth === 1) return { depth: 2, path: { ...state.path, aspectCode: key } };
  if (state.depth === 2 && /^[1-6]$/.test(key)) return { depth: 3, path: { ...state.path, frequencyLevel: Number(key) } };
  if (state.depth === 3 && ["planet", "herb", "sound", "geometry", "body", "day"].includes(key)) {
    return { depth: 4, path: { ...state.path, correspondenceKey: key as CorrespondenceKey } };
  }
  return state;
}

export function ascend(state: DepthState): DepthState {
  if (state.depth === 0) return state;
  if (state.depth === 1) return INITIAL_DEPTH_STATE;
  if (state.depth === 2) return { depth: 1, path: { core: state.path.core } };
  if (state.depth === 3) return { depth: 2, path: { ...state.path, frequencyLevel: undefined } };
  return { depth: 3, path: { ...state.path, correspondenceKey: undefined } };
}

export function jumpTo(state: DepthState, depth: Depth): DepthState {
  if (depth > state.depth) return state;
  const path = { ...state.path };
  if (depth < 4) delete path.correspondenceKey;
  if (depth < 3) delete path.frequencyLevel;
  if (depth < 2) delete path.aspectCode;
  if (depth < 1) delete path.core;
  return { depth, path };
}

export function breadcrumbs(state: DepthState): Array<{ label: string; depth: Depth }> {
  const result: Array<{ label: string; depth: Depth }> = [{ label: "Orrery", depth: 0 }];
  if (state.path.core) result.push({ label: state.path.core, depth: 1 });
  if (state.path.aspectCode) result.push({ label: state.path.aspectCode, depth: 2 });
  if (state.path.frequencyLevel) result.push({ label: `Level ${state.path.frequencyLevel}`, depth: 3 });
  if (state.path.correspondenceKey) result.push({ label: state.path.correspondenceKey, depth: 4 });
  return result;
}
