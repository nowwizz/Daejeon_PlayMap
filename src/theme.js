// 대전 상징 색 (초록 / 노란색 / 흰색) 기반 테마
export const THEME = {
  main: '#00B398',
  mainLight: '#E1F6F1',
  sub: '#FFCC11',
  subLight: '#FFF7DC',
  subDeep: '#8A6A00'
}

export const CATEGORIES = ['전체', '관광지', '여행코스', '음식점', '축제']

export function catStyle(cat) {
  switch (cat) {
    case '관광지': return { bg: '#FFEAD5', fg: '#C2600A', dot: '#E08A2E' }
    case '여행코스': return { bg: THEME.mainLight, fg: THEME.main, dot: THEME.main }
    case '음식점': return { bg: '#FDE2E9', fg: '#C2447A', dot: '#E27DA0' }
    case '축제': return { bg: THEME.subLight, fg: THEME.subDeep, dot: THEME.subDeep }
    default: return { bg: '#eeeeee', fg: '#666666', dot: '#bbbbbb' }
  }
}
