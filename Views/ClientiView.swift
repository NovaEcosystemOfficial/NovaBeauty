import SwiftUI
import SwiftData
import Contacts

struct ClientiView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject private var session: AuthSessionManager

    @Environment(\.modelContext) private var context
    @Query private var clienti: [Cliente]
    
    @State private var nome = ""
    @State private var telefono = ""
    @State private var errorMessage = ""

    private var clientiUtente: [Cliente] {
        guard let userID = session.user?.uid else { return [] }
        return clienti
            .filter { $0.ownerID == userID }
            .sorted { $0.nome.localizedCaseInsensitiveCompare($1.nome) == .orderedAscending }
    }

    var body: some View {
        NavigationStack {
            
            ZStack {
                themeManager.theme.background
                    .ignoresSafeArea()
                
                VStack {
                    
                    List {
                        ForEach(clientiUtente) { cliente in
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(cliente.nome)
                                    .font(.headline)
                                    .foregroundColor(themeManager.theme.text)
                                
                                Text(cliente.telefono)
                                    .font(.subheadline)
                                    .foregroundColor(themeManager.theme.text.opacity(0.6))
                            }
                            .padding(.vertical, 6)
                        }
                        .onDelete(perform: eliminaCliente)
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                    
                    VStack(spacing: 10) {
                        
                        TextField("Nome cliente", text: $nome)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(.name)
                        
                        TextField("Telefono", text: $telefono)
                            .textFieldStyle(.roundedBorder)
                            .keyboardType(.phonePad)
                            .textContentType(.telephoneNumber)
                        
                        Button("Aggiungi Cliente") {
                            aggiungiCliente()
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(themeManager.theme.primary)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        
                        Button("Importa dalla rubrica") {
                            importContacts()
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(themeManager.theme.card)
                        .foregroundColor(themeManager.theme.text)
                        .cornerRadius(12)
                    }
                    .padding()
                }
            }
            .navigationTitle("Clienti")
        }
        .alert("Attenzione", isPresented: Binding(
            get: { !errorMessage.isEmpty },
            set: { if !$0 { errorMessage = "" } }
        )) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
    
    private func aggiungiCliente() {
        guard let userID = session.user?.uid else {
            errorMessage = "Sessione non valida."
            return
        }
        let cleanName = nome.trimmed
        let cleanPhone = telefono.trimmed
        guard !cleanName.isEmpty, !cleanPhone.isEmpty else {
            errorMessage = "Nome e telefono sono obbligatori."
            return
        }
        guard !clientiUtente.contains(where: { $0.telefono == cleanPhone }) else {
            errorMessage = "Esiste già un cliente con questo numero."
            return
        }

        let nuovo = Cliente(ownerID: userID, nome: cleanName, telefono: cleanPhone)
        context.insert(nuovo)
        nome = ""
        telefono = ""
    }
    
    private func eliminaCliente(at offsets: IndexSet) {
        for index in offsets {
            context.delete(clientiUtente[index])
        }
        do {
            try context.save()
        } catch {
            errorMessage = "Eliminazione non riuscita: \(error.localizedDescription)"
        }
    }
    
    private func importContacts() {
        guard let userID = session.user?.uid else {
            errorMessage = "Sessione non valida."
            return
        }
        let store = CNContactStore()
        
        store.requestAccess(for: .contacts) { granted, error in
            
            if granted {
                
                DispatchQueue.global(qos: .userInitiated).async {
                    
                    let keys = [
                        CNContactGivenNameKey,
                        CNContactFamilyNameKey,
                        CNContactPhoneNumbersKey
                    ] as [CNKeyDescriptor]
                    
                    let request = CNContactFetchRequest(keysToFetch: keys)
                    
                    do {
                        
                        try store.enumerateContacts(with: request) { contact, stop in
                            
                            let name = contact.givenName + " " + contact.familyName
                            let phone = contact.phoneNumbers.first?.value.stringValue ?? ""
                            
                            if phone.isEmpty { return }
                            
                            DispatchQueue.main.async {
                                
                                if !clientiUtente.contains(where: { $0.telefono == phone }) {
                                    
                                    let nuovoCliente = Cliente(ownerID: userID, nome: name.trimmed, telefono: phone)
                                    context.insert(nuovoCliente)
                                    
                                }
                            }
                        }
                        
                    } catch {
                        DispatchQueue.main.async {
                            errorMessage = "Importazione non riuscita: \(error.localizedDescription)"
                        }
                    }
                }
            } else if let error {
                DispatchQueue.main.async {
                    errorMessage = "Accesso ai contatti non consentito: \(error.localizedDescription)"
                }
            } else {
                DispatchQueue.main.async {
                    errorMessage = "Consenti l’accesso ai contatti dalle Impostazioni di iOS."
                }
            }
        }
    }
}
