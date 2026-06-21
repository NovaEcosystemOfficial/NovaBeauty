import SwiftUI
import SwiftData

struct NuovoAppuntamentoView: View {
    @EnvironmentObject var themeManager: ThemeManager
    
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @Query private var clienti: [Cliente]
    
    @State private var clienteSelezionato: Cliente?
    @State private var data = Date()
    @State private var servizio = ""
    @State private var prezzo = ""
    @State private var promemoriaMinuti: Int = 60
    
    var body: some View {
        NavigationStack {
            
            ZStack {
                themeManager.theme.background
                    .ignoresSafeArea()
                
                Form {
                    
                    Picker("Cliente", selection: $clienteSelezionato) {
                        ForEach(clienti) { cliente in
                            Text(cliente.nome).tag(Optional(cliente))
                        }
                    }
                    
                    DatePicker("Data", selection: $data)
                    
                    Picker("Promemoria", selection: $promemoriaMinuti) {
                        Text("Nessuno").tag(0)
                        Text("30 minuti prima").tag(30)
                        Text("1 ora prima").tag(60)
                        Text("2 ore prima").tag(120)
                        Text("1 giorno prima").tag(1440)
                    }
                    
                    TextField("Servizio", text: $servizio)
                    
                    TextField("Prezzo", text: $prezzo)
                        .keyboardType(.decimalPad)
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Nuovo Appuntamento")
            .toolbar {
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salva") {
                        salva()
                    }
                    .foregroundColor(themeManager.theme.primary)
                }
                
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annulla") {
                        dismiss()
                    }
                    .foregroundColor(themeManager.theme.text)
                }
            }
        }
    }
    
    private func salva() {
        guard let cliente = clienteSelezionato,
              let prezzoDouble = Double(prezzo) else { return }
        
        let nuovo = Appuntamento(
            data: data,
            cliente: cliente,
            servizio: servizio,
            prezzo: prezzoDouble
        )
        
        context.insert(nuovo)
        programmaNotifica(per: nuovo)
        dismiss()
    }
    
    private func programmaNotifica(per appuntamento: Appuntamento) {
        
        guard promemoriaMinuti > 0 else { return }
        
        let contenuto = UNMutableNotificationContent()
        contenuto.title = "Promemoria Appuntamento"
        contenuto.body = "\(appuntamento.cliente.nome) - \(appuntamento.servizio)"
        contenuto.sound = .default
        
        let triggerDate = appuntamento.data.addingTimeInterval(TimeInterval(-promemoriaMinuti * 60))
        
        if triggerDate > Date() {
            let trigger = UNTimeIntervalNotificationTrigger(
                timeInterval: triggerDate.timeIntervalSinceNow,
                repeats: false
            )
            
            let richiesta = UNNotificationRequest(
                identifier: UUID().uuidString,
                content: contenuto,
                trigger: trigger
            )
            
            UNUserNotificationCenter.current().add(richiesta)
        }
    }
}
