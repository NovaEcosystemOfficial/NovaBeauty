import SwiftData

@Model
class ProfiloAttivita {

    var nome: String
    var telefono: String
    var indirizzo: String
    var email: String
    var orari: String
    var tipoAttivita: String

    init(nome: String,
         telefono: String,
         indirizzo: String,
         email: String,
         orari: String,
         tipoAttivita: String) {

        self.nome = nome
        self.telefono = telefono
        self.indirizzo = indirizzo
        self.email = email
        self.orari = orari
        self.tipoAttivita = tipoAttivita
    }
}
