import Foundation
import SwiftData

@Model
final class ProdottoMagazzino {
    var syncID: UUID = UUID()
    var ownerID: String = ""
    var nome: String
    var categoria: String
    var quantita: Int
    var sogliaMinima: Int
    var linkFornitore: String
    
    init(ownerID: String, nome: String, categoria: String, quantita: Int, sogliaMinima: Int, linkFornitore: String) {
        self.ownerID = ownerID
        self.nome = nome
        self.categoria = categoria
        self.quantita = quantita
        self.sogliaMinima = sogliaMinima
        self.linkFornitore = linkFornitore
    }
}
