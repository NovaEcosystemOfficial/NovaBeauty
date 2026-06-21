import Foundation
import FirebaseFirestore
import SwiftData

private struct BackupEnvelope: Codable {
    struct ClienteDTO: Codable {
        let id: UUID
        let nome: String
        let telefono: String
        let note: String?
    }

    struct AppuntamentoDTO: Codable {
        let id: UUID
        let data: Date
        let clienteID: UUID?
        let servizio: String
        let prezzo: Double
        let notificationIdentifier: String
    }

    struct ProdottoDTO: Codable {
        let id: UUID
        let nome: String
        let categoria: String
        let quantita: Int
        let sogliaMinima: Int
        let linkFornitore: String
    }

    struct ProfiloDTO: Codable {
        let id: UUID
        let nome: String
        let telefono: String
        let indirizzo: String
        let email: String
        let orari: String
        let tipoAttivita: String
        let descrizione: String
        let immagine: Data?
    }

    struct ServizioDTO: Codable {
        let id: UUID
        let nome: String
        let prezzo: Double
        let durata: Int
    }

    let version: Int
    let createdAt: Date
    let clienti: [ClienteDTO]
    let appuntamenti: [AppuntamentoDTO]
    let prodotti: [ProdottoDTO]
    let profili: [ProfiloDTO]
    let servizi: [ServizioDTO]
}

@MainActor
enum CloudBackupService {
    private static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }()

    private static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()

    static func backup(userID: String, context: ModelContext) async throws {
        let clienti = try context.fetch(FetchDescriptor<Cliente>()).filter { $0.ownerID == userID }
        let appuntamenti = try context.fetch(FetchDescriptor<Appuntamento>()).filter { $0.ownerID == userID }
        let prodotti = try context.fetch(FetchDescriptor<ProdottoMagazzino>()).filter { $0.ownerID == userID }
        let profili = try context.fetch(FetchDescriptor<ProfiloAttivita>()).filter { $0.ownerID == userID }
        let servizi = try context.fetch(FetchDescriptor<Servizio>()).filter { $0.ownerID == userID }

        let envelope = BackupEnvelope(
            version: 1,
            createdAt: Date(),
            clienti: clienti.map {
                .init(id: $0.syncID, nome: $0.nome, telefono: $0.telefono, note: $0.note)
            },
            appuntamenti: appuntamenti.map {
                .init(
                    id: $0.syncID,
                    data: $0.data,
                    clienteID: $0.cliente?.syncID,
                    servizio: $0.servizio,
                    prezzo: $0.prezzo,
                    notificationIdentifier: $0.notificationIdentifier
                )
            },
            prodotti: prodotti.map {
                .init(
                    id: $0.syncID,
                    nome: $0.nome,
                    categoria: $0.categoria,
                    quantita: $0.quantita,
                    sogliaMinima: $0.sogliaMinima,
                    linkFornitore: $0.linkFornitore
                )
            },
            profili: profili.map {
                .init(
                    id: $0.syncID,
                    nome: $0.nome,
                    telefono: $0.telefono,
                    indirizzo: $0.indirizzo,
                    email: $0.email,
                    orari: $0.orari,
                    tipoAttivita: $0.tipoAttivita,
                    descrizione: $0.descrizione,
                    immagine: $0.immagine
                )
            },
            servizi: servizi.map {
                .init(id: $0.syncID, nome: $0.nome, prezzo: $0.prezzo, durata: $0.durata)
            }
        )

        let payload = try encoder.encode(envelope)
        try await backupDocument(for: userID).setData([
            "payload": payload,
            "version": envelope.version,
            "updatedAt": FieldValue.serverTimestamp()
        ])
    }

    static func restoreIfLocalDataIsMissing(userID: String, context: ModelContext) async throws -> Bool {
        let localProfiles = try context.fetch(FetchDescriptor<ProfiloAttivita>())
            .contains { $0.ownerID == userID }
        guard !localProfiles else { return false }

        let snapshot = try await backupDocument(for: userID).getDocument()
        guard snapshot.exists, let payload = snapshot.data()?["payload"] as? Data else {
            return false
        }

        let envelope = try decoder.decode(BackupEnvelope.self, from: payload)
        var clientiByID: [UUID: Cliente] = [:]

        for item in envelope.clienti {
            let cliente = Cliente(ownerID: userID, nome: item.nome, telefono: item.telefono, note: item.note)
            cliente.syncID = item.id
            clientiByID[item.id] = cliente
            context.insert(cliente)
        }

        for item in envelope.servizi {
            let servizio = Servizio(ownerID: userID, nome: item.nome, prezzo: item.prezzo, durata: item.durata)
            servizio.syncID = item.id
            context.insert(servizio)
        }

        for item in envelope.prodotti {
            let prodotto = ProdottoMagazzino(
                ownerID: userID,
                nome: item.nome,
                categoria: item.categoria,
                quantita: item.quantita,
                sogliaMinima: item.sogliaMinima,
                linkFornitore: item.linkFornitore
            )
            prodotto.syncID = item.id
            context.insert(prodotto)
        }

        for item in envelope.profili {
            let profilo = ProfiloAttivita(
                ownerID: userID,
                nome: item.nome,
                telefono: item.telefono,
                indirizzo: item.indirizzo,
                email: item.email,
                orari: item.orari,
                tipoAttivita: item.tipoAttivita,
                descrizione: item.descrizione,
                immagine: item.immagine
            )
            profilo.syncID = item.id
            context.insert(profilo)
        }

        for item in envelope.appuntamenti {
            guard let clienteID = item.clienteID, let cliente = clientiByID[clienteID] else { continue }
            let appuntamento = Appuntamento(
                ownerID: userID,
                data: item.data,
                cliente: cliente,
                servizio: item.servizio,
                prezzo: item.prezzo
            )
            appuntamento.syncID = item.id
            appuntamento.notificationIdentifier = item.notificationIdentifier
            context.insert(appuntamento)
        }

        try context.save()
        return true
    }

    private static func backupDocument(for userID: String) -> DocumentReference {
        Firestore.firestore()
            .collection("users")
            .document(userID)
            .collection("backups")
            .document("current")
    }
}
