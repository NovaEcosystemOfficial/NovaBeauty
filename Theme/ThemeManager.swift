import SwiftUI
import Combine

class ThemeManager: ObservableObject {
    
    @Published var theme: Theme = ThemeManager.estetica
    
    // 💅 ESTETICA (ROSA PREMIUM)
    static let estetica = Theme(
        primary: Color(hex: "#D8A7B1"),      // rosa cipria
        secondary: Color(hex: "#EAC7CF"),    // rosa chiaro
        background: Color.white,             // ✅ BIANCO
        card: Color(hex: "#F8F4F6"),         // rosa super soft
        text: Color.black                   // testo scuro
    )    // 🔥 BARBER (NERO + ORO)
    static let barber = Theme(
        primary: Color(hex: "#F2C94C"),
        secondary: Color(hex: "#F2994A"),
        background: Color.black,
        card: Color.white.opacity(0.05),
        text: Color.white
    )
    
    // 💅 NAILS (VIOLA ELEGANTE)
    static let nails = Theme(
        primary: Color(hex: "#9B51E0"),
        secondary: Color(hex: "#C084FC"),
        background: Color.black,
        card: Color.white.opacity(0.05),
        text: Color.white
    )
    
    // ✂️ HAIR (MINIMAL PREMIUM)
    static let hair = Theme(
        primary: Color(hex: "#6B7280"),      // grigio elegante
        secondary: Color(hex: "#9CA3AF"),    // grigio chiaro
        background: Color.white,             // bianco pulito
        card: Color(hex: "#F3F4F6"),         // grigio super soft
        text: Color.black
    )
    func aggiornaTema(tipo: String) {
        withAnimation(.easeInOut(duration: 0.3)) {
            switch tipo {
            case "barber":
                theme = Self.barber
            case "nails":
                theme = Self.nails
            case "parrucchiere":
                theme = Self.hair
            default:
                theme = Self.estetica
            }
        }
    }
}
