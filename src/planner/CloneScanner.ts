import SegmentReader from 'utils/SegmentReader'

interface CloneInfo {
  name: string
  abbreviation: string
  members: string[]
  primary: string
  url: string
}

export default class CloneScanner {
  private result?: { [key: string]: CloneInfo }

  get clones() {
    if (this.result) return this.result
    const data = SegmentReader.instance.read('LeagueOfAutomatedNations', 98)
    if (!data) return
    try {
      console.log('clones', data.slice(0, 100))
      this.result = JSON.parse(data)
    } catch (err) {
      console.log('Error parsing clone data:', err)
    }
    return this.result
  }
}
