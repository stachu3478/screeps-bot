import SegmentReader from 'utils/SegmentReader'

export default class AlianceScanner {
  private result?: { [key: string]: string[] }

  get aliances() {
    if (this.result) return this.result
    const data = SegmentReader.instance.read('LeagueOfAutomatedNations', 99)
    if (!data) return
    try {
      this.result = JSON.parse(data)
    } catch (err) {
      console.log('Error parsing aliance data:', err)
    }
    return this.result
  }
}
