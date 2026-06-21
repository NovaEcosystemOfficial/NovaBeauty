import Foundation
import Combine
import FirebaseAuth
import SwiftData

@MainActor
final class AuthSessionManager: ObservableObject {
    @Published private(set) var user: User?
    @Published private(set) var isLoading = true

    private var listener: AuthStateDidChangeListenerHandle?

    init() {
        listener = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            self?.user = user
            self?.isLoading = false
        }
    }

    deinit {
        if let listener {
            Auth.auth().removeStateDidChangeListener(listener)
        }
    }

    func signOut() throws {
        try Auth.auth().signOut()
    }
}

@MainActor
enum DataOwnershipMigrator {
    static func claimLegacyData(for userID: String, in context: ModelContext) throws {
        var changed = false

        for cliente in try context.fetch(FetchDescriptor<Cliente>()) where cliente.ownerID.isEmpty {
            cliente.ownerID = userID
            changed = true
        }
        for appuntamento in try context.fetch(FetchDescriptor<Appuntamento>()) where appuntamento.ownerID.isEmpty {
            appuntamento.ownerID = userID
            changed = true
        }
        for prodotto in try context.fetch(FetchDescriptor<ProdottoMagazzino>()) where prodotto.ownerID.isEmpty {
            prodotto.ownerID = userID
            changed = true
        }
        for profilo in try context.fetch(FetchDescriptor<ProfiloAttivita>()) where profilo.ownerID.isEmpty {
            profilo.ownerID = userID
            changed = true
        }
        for servizio in try context.fetch(FetchDescriptor<Servizio>()) where servizio.ownerID.isEmpty {
            servizio.ownerID = userID
            changed = true
        }

        if changed {
            try context.save()
        }
    }
}
