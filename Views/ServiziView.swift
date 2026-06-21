import SwiftUI
import SwiftData

struct ServiziView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject private var session: AuthSessionManager

    @Environment(\.modelContext) private var context
    @Query private var servizi: [Servizio]
    
    @State private var nome = ""
    @State private var prezzo = ""
    @State private var durata = ""
    @State private var errorMessage = ""

    private var serviziUtente: [Servizio] {
        guard let userID = session.user?.uid else { return [] }
        return servizi
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
                        ForEach(serviziUtente) { servizio in
                            
                            VStack(alignment: .leading, spacing: 4) {
                                
                                Text(servizio.nome)
                                    .font(.headline)
                                    .foregroundColor(themeManager.theme.text)
                                
                                HStack {
                                    Text(servizio.prezzo, format: .currency(code: "EUR"))
                                    Text("•")
                                    Text("\(servizio.durata) min")
                                }
                                .font(.subheadline)
                                .foregroundColor(themeManager.theme.text.opacity(0.6))
                            }
                            .padding(.vertical, 6)
                        }
                        .onDelete(perform: eliminaServizio)
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                    
                    VStack(spacing: 10) {
                        
                        TextField("Nome servizio", text: $nome)
                            .textFieldStyle(.roundedBorder)
                        
                        TextField("Prezzo", text: $prezzo)
                            .textFieldStyle(.roundedBorder)
                            .keyboardType(.decimalPad)
                        
                        TextField("Durata minuti", text: $durata)
                            .textFieldStyle(.roundedBorder)
                            .keyboardType(.numberPad)
                        
                        Button("Aggiungi Servizio") {
                            aggiungiServizio()
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(themeManager.theme.primary)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        
                    }
                    .padding()
                }
            }
            .navigationTitle("Servizi")
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
    
    private func aggiungiServizio() {
        guard let userID = session.user?.uid else {
            errorMessage = "Sessione non valida."
            return
        }
        let cleanName = nome.trimmed
        guard !cleanName.isEmpty,
              let prezzoDouble = InputParser.decimal(prezzo), prezzoDouble >= 0,
              let durataInt = Int(durata), durataInt > 0 else {
            errorMessage = "Inserisci nome, prezzo valido e durata maggiore di zero."
            return
        }
        guard !serviziUtente.contains(where: { $0.nome.caseInsensitiveCompare(cleanName) == .orderedSame }) else {
            errorMessage = "Esiste già un servizio con questo nome."
            return
        }
        
        let nuovo = Servizio(
            ownerID: userID,
            nome: cleanName,
            prezzo: prezzoDouble,
            durata: durataInt
        )
        
        context.insert(nuovo)
        
        nome = ""
        prezzo = ""
        durata = ""
    }
    
    private func eliminaServizio(at offsets: IndexSet) {
        for index in offsets {
            context.delete(serviziUtente[index])
        }
        do {
            try context.save()
        } catch {
            errorMessage = "Eliminazione non riuscita: \(error.localizedDescription)"
        }
    }
}
