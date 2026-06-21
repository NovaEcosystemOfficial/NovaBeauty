import Foundation
import SwiftData

@Model
class Servizio {
    
    var nome: String
    var prezzo: Double
    var durata: Int
    
    init(nome: String, prezzo: Double, durata: Int) {
        self.nome = nome
        self.prezzo = prezzo
        self.durata = durata
    }
}
