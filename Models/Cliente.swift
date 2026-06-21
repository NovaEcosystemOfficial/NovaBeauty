import Foundation
import SwiftData

@Model
class Cliente {
    var nome: String
    var telefono: String
    var note: String?
    
    init(nome: String, telefono: String, note: String? = nil) {
        self.nome = nome
        self.telefono = telefono
        self.note = note
    }
}
