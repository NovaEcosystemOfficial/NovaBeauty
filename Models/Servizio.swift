import Foundation
import SwiftData

@Model
final class Servizio {
    var syncID: UUID = UUID()
    var ownerID: String = ""
    var nome: String
    var prezzo: Double
    var durata: Int
    
    init(ownerID: String, nome: String, prezzo: Double, durata: Int) {
        self.ownerID = ownerID
        self.nome = nome
        self.prezzo = prezzo
        self.durata = durata
    }
}
