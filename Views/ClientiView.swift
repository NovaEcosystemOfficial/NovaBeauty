import SwiftUI
import SwiftData
import Contacts

struct ClientiView: View {
    @EnvironmentObject var themeManager: ThemeManager
    
    @Environment(\.modelContext) private var context
    @Query private var clienti: [Cliente]
    
    @State private var nome = ""
    @State private var telefono = ""
    
    var body: some View {
        NavigationStack {
            
            ZStack {
                themeManager.theme.background
                    .ignoresSafeArea()
                
                VStack {
                    
                    List {
                        ForEach(clienti) { cliente in
                            
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
                        
                        TextField("Telefono", text: $telefono)
                            .textFieldStyle(.roundedBorder)
                        
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
    }
    
    private func aggiungiCliente() {
        let nuovo = Cliente(nome: nome, telefono: telefono)
        context.insert(nuovo)
        nome = ""
        telefono = ""
    }
    
    private func eliminaCliente(at offsets: IndexSet) {
        for index in offsets {
            context.delete(clienti[index])
        }
    }
    
    private func importContacts() {
        
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
                                
                                if !clienti.contains(where: { $0.telefono == phone }) {
                                    
                                    let nuovoCliente = Cliente(nome: name, telefono: phone)
                                    context.insert(nuovoCliente)
                                    
                                }
                            }
                        }
                        
                    } catch {
                        print("Errore contatti:", error)
                    }
                }
            }
        }
    }
}
