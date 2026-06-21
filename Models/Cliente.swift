import Foundation
import SwiftData

@Model
final class Cliente {
    var syncID: UUID = UUID()
    var ownerID: String = ""
    var nome: String
    var telefono: String
    var note: String?

    @Relationship(deleteRule: .cascade, inverse: \Appuntamento.cliente)
    var appuntamenti: [Appuntamento] = []

    init(ownerID: String, nome: String, telefono: String, note: String? = nil) {
        self.ownerID = ownerID
        self.nome = nome
        self.telefono = telefono
        self.note = note
    }
}
