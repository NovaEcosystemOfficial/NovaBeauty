import Foundation

enum InputParser {
    static func decimal(_ text: String) -> Double? {
        let formatter = NumberFormatter()
        formatter.locale = .current
        formatter.numberStyle = .decimal

        if let value = formatter.number(from: text)?.doubleValue {
            return value
        }

        return Double(text.replacingOccurrences(of: ",", with: "."))
    }
}

extension String {
    var trimmed: String {
        trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
