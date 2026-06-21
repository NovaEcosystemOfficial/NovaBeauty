import SwiftUI
import SwiftData
import UserNotifications

struct NuovoAppuntamentoView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject private var session: AuthSessionManager

    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @Query private var clienti: [Cliente]
    @Query private var servizi: [Servizio]

    @State private var clienteSelezionato: Cliente?
    @State private var servizioSelezionato: Servizio?
    @State private var data = Date()
    @State private var servizio = ""
    @State private var prezzo = ""
    @State private var promemoriaMinuti: Int = 60
    @State private var errorMessage = ""

    private var clientiUtente: [Cliente] {
        guard let userID = session.user?.uid else { return [] }
        return clienti
            .filter { $0.ownerID == userID }
            .sorted { $0.nome.localizedCaseInsensitiveCompare($1.nome) == .orderedAscending }
    }

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
                
                Form {
                    
                    Picker("Cliente", selection: $clienteSelezionato) {
                        Text("Seleziona cliente").tag(nil as Cliente?)
                        ForEach(clientiUtente) { cliente in
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
                    
                    Picker("Servizio", selection: $servizioSelezionato) {
                        Text("Seleziona servizio").tag(nil as Servizio?)
                        ForEach(serviziUtente) { item in
                            Text("\(item.nome) · \(item.durata) min").tag(Optional(item))
                        }
                    }
                    .onChange(of: servizioSelezionato) { _, nuovoServizio in
                        guard let nuovoServizio else { return }
                        servizio = nuovoServizio.nome
                        prezzo = nuovoServizio.prezzo.formatted(.number.precision(.fractionLength(2)))
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
        .alert("Dati non validi", isPresented: Binding(
            get: { !errorMessage.isEmpty },
            set: { if !$0 { errorMessage = "" } }
        )) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
    
    private func salva() {
        guard let userID = session.user?.uid else {
            errorMessage = "Sessione non valida."
            return
        }
        guard let cliente = clienteSelezionato else {
            errorMessage = "Seleziona un cliente."
            return
        }
        guard !servizio.trimmed.isEmpty,
              let prezzoDouble = InputParser.decimal(prezzo), prezzoDouble >= 0 else {
            errorMessage = "Seleziona un servizio e inserisci un prezzo valido."
            return
        }
        guard data > Date() else {
            errorMessage = "La data dell’appuntamento deve essere futura."
            return
        }
        
        let nuovo = Appuntamento(
            ownerID: userID,
            data: data,
            cliente: cliente,
            servizio: servizio.trimmed,
            prezzo: prezzoDouble
        )
        
        context.insert(nuovo)
        do {
            try context.save()
            programmaNotifica(per: nuovo)
            dismiss()
        } catch {
            context.delete(nuovo)
            errorMessage = "Salvataggio non riuscito: \(error.localizedDescription)"
        }
    }
    
    private func programmaNotifica(per appuntamento: Appuntamento) {
        
        guard promemoriaMinuti > 0 else { return }
        
        let contenuto = UNMutableNotificationContent()
        contenuto.title = "Promemoria Appuntamento"
        contenuto.body = "\(appuntamento.cliente?.nome ?? "Cliente") - \(appuntamento.servizio)"
        contenuto.sound = .default
        
        let triggerDate = appuntamento.data.addingTimeInterval(TimeInterval(-promemoriaMinuti * 60))
        
        if triggerDate > Date() {
            let trigger = UNTimeIntervalNotificationTrigger(
                timeInterval: triggerDate.timeIntervalSinceNow,
                repeats: false
            )
            
            let richiesta = UNNotificationRequest(
                identifier: appuntamento.notificationIdentifier,
                content: contenuto,
                trigger: trigger
            )
            
            let center = UNUserNotificationCenter.current()
            center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
                guard granted else { return }
                center.add(richiesta)
            }
        }
    }
}
