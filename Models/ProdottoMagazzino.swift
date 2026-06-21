import Foundation
import SwiftData

@Model
class ProdottoMagazzino {
    var nome: String
    var categoria: String
    var quantita: Int
    var sogliaMinima: Int
    var linkFornitore: String
    
    init(nome: String, categoria: String, quantita: Int, sogliaMinima: Int, linkFornitore: String) {
        self.nome = nome
        self.categoria = categoria
        self.quantita = quantita
        self.sogliaMinima = sogliaMinima
        self.linkFornitore = linkFornitore
    }
}
