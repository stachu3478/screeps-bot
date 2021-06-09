import MyRooms from 'room/MyRooms'

export default class Report {
  showLinks() {
    console.log('<h3>Links</h3>')
    MyRooms.get().forEach((room) => {
      const roomLinks = room.links
      let info = `Room ${room.name} | Controller: LC | Spawn: LS | Drains: `
      if (roomLinks.controller) {
        info = info.replace('LC', this.linkChargeSpan(roomLinks.controller))
      } else {
        info = info.replace('LC', this.noLinkWarning())
      }
      if (roomLinks.spawny) {
        info = info.replace('LS', this.linkChargeSpan(roomLinks.spawny))
      } else {
        info = info.replace('LS', this.noLinkWarning())
      }
      roomLinks.drains.forEach((link) => {
        info += this.linkChargeSpan(link)
      })
      console.log(info)
    })
  }

  private linkChargeSpan(link: StructureLink) {
    const energy = link.store[RESOURCE_ENERGY]
    const outerSpan =
      '<span style="width: 100px; border: 1px white solid">content</span>'
    const innerSpan = `<span style="width: ${
      (100 * energy) / LINK_CAPACITY
    }px; background-color: yellow">${energy}</span>`
    return outerSpan.replace('content', innerSpan)
  }

  private noLinkWarning() {
    return `<span style="width: 100px; color: red; font-weight: bold">X</span>`
  }
}
