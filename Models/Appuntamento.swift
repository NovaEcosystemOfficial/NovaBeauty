import Foundation
import SwiftData

@Model
final class Appuntamento {
    var syncID: UUID = UUID()
    var ownerID: String = ""
    var data: Date
    var cliente: Cliente?
    var servizio: String
    var prezzo: Double
    var notificationIdentifier: String = UUID().uuidString

    init(ownerID: String, data: Date, cliente: Cliente, servizio: String, prezzo: Double) {
        self.ownerID = ownerID
        self.data = data
        self.cliente = cliente
        self.servizio = servizio
        self.prezzo = prezzo
    }
}
