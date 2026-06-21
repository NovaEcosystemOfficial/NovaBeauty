import Foundation
import SwiftData

@Model
class Appuntamento: Identifiable {
    var data: Date
    var cliente: Cliente
    var servizio: String
    var prezzo: Double
    
    init(data: Date, cliente: Cliente, servizio: String, prezzo: Double) {
        self.data = data
        self.cliente = cliente
        self.servizio = servizio
        self.prezzo = prezzo
    }
}
