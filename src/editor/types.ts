export type ShapeKind = 'rect' | 'ellipse'

export interface Shape {
  id: string
  kind: ShapeKind
  x: number
  y: number
  w: number
  h: number
  fill: string
}

export interface Bounds {
  x: number
  y: number
  w: number
  h: number
}

export type AlignMode = 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom'
export type Axis = 'horizontal' | 'vertical'
