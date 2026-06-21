import Foundation
import SwiftData

@Model
final class ProfiloAttivita {
    var syncID: UUID = UUID()
    var ownerID: String = ""
    var nome: String
    var telefono: String
    var indirizzo: String
    var email: String
    var orari: String
    var tipoAttivita: String
    var descrizione: String = ""
    @Attribute(.externalStorage) var immagine: Data?

    init(ownerID: String,
         nome: String,
         telefono: String,
         indirizzo: String,
         email: String,
         orari: String,
         tipoAttivita: String,
         descrizione: String = "",
         immagine: Data? = nil) {

        self.ownerID = ownerID
        self.nome = nome
        self.telefono = telefono
        self.indirizzo = indirizzo
        self.email = email
        self.orari = orari
        self.tipoAttivita = tipoAttivita
        self.descrizione = descrizione
        self.immagine = immagine
    }
}
