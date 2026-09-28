// Visual layer of the Factur-X PDF. The invoice arrives as JSON through
// `sys.inputs.invoice` (the stored payload, dates as ISO strings); factur-x-ts
// then embeds the CII XML into the PDF/A-3 this template produces.

#let inv = json(bytes(sys.inputs.invoice))

#let accent = rgb("#5b21b6")
#let muted = rgb("#6b6375")
#let rule = rgb("#e5e4e7")

#set document(title: "Facture " + inv.number, author: inv.seller.name)
#set page(
  paper: "a4",
  margin: (x: 18mm, top: 18mm, bottom: 22mm),
  footer: context [
    #set text(8pt, fill: muted)
    #inv.seller.name
    #if "legalId" in inv.seller [ · SIRET #inv.seller.legalId]
    #if "vatId" in inv.seller [ · TVA #inv.seller.vatId]
    #h(1fr)
    Page #counter(page).display() / #counter(page).final().first()
  ],
)
#set text(font: "Libertinus Serif", size: 10pt, lang: "fr")

// --- formatting helpers -----------------------------------------------------

#let currency-symbol = (EUR: "€", USD: "$", GBP: "£").at(inv.currency, default: inv.currency)

// Amounts arrive as numbers (created invoices) or canonical decimal strings
// (parsed ones, since factur-x-ts 0.3), so everything goes through float().
// French money format: 1 234,50 €. Works on cents to avoid float noise.
#let money(value) = {
  let value = float(value)
  let cents = calc.round(calc.abs(value) * 100)
  let units = str(int(calc.quo(cents, 100)))
  let rest = int(calc.rem(cents, 100))
  let groups = ()
  while units.len() > 3 {
    groups.insert(0, units.slice(units.len() - 3))
    units = units.slice(0, units.len() - 3)
  }
  groups.insert(0, units)
  let sign = if value < 0 { "−" } else { "" }
  let decimals = if rest < 10 { "0" + str(rest) } else { str(rest) }
  sign + groups.join("\u{202F}") + "," + decimals + "\u{00A0}" + currency-symbol
}

// "20.00" and 20 both print as 20.
#let number(value) = str(float(value)).replace(".", ",")

#let date(iso) = {
  let parts = iso.slice(0, 10).split("-")
  parts.at(2) + "/" + parts.at(1) + "/" + parts.at(0)
}

#let type-label = (
  "380": "Facture",
  "381": "Avoir",
  "386": "Facture d'acompte",
  "500": "Facture auto-liquidée",
).at(inv.typeCode, default: "Facture")

#let party(title, p) = block(width: 100%, inset: 10pt, radius: 4pt, stroke: rule)[
  #text(8pt, fill: muted, upper(title)) \
  #strong(p.name) \
  #p.address.lineOne \
  #if "lineTwo" in p.address [#p.address.lineTwo \ ]
  #p.address.postcode #p.address.city (#p.address.country)
  #if "vatId" in p [\ #text(fill: muted)[TVA : #p.vatId]]
  #if "legalId" in p [\ #text(fill: muted)[SIRET : #p.legalId]]
]

// --- header -----------------------------------------------------------------

#grid(
  columns: (1fr, auto),
  align: (left + top, right + top),
  text(18pt, weight: "bold", fill: accent, inv.seller.name),
  [
    #text(16pt, weight: "bold", upper(type-label)) \
    #text(fill: muted)[N° ] #strong(inv.number) \
    #text(fill: muted)[Émise le ] #date(inv.issueDate)
    #if "paymentDueDate" in inv [
      \ #text(fill: muted)[Échéance ] #strong(date(inv.paymentDueDate))
    ]
    #if "billingPeriod" in inv [
      \ #text(fill: muted)[Période : ]
      #date(inv.billingPeriod.startDate) – #date(inv.billingPeriod.endDate)
    ]
  ],
)

#v(10mm)

#grid(
  columns: (1fr, 1fr),
  gutter: 8mm,
  party("Émetteur", inv.seller),
  party("Destinataire", inv.buyer),
)

#v(8mm)

// --- lines ------------------------------------------------------------------

#table(
  columns: (1fr, auto, auto, auto, auto),
  align: (left, right, right, right, right),
  stroke: (x, y) => if y == 0 { (bottom: 0.8pt + accent) } else { (bottom: 0.4pt + rule) },
  inset: (x: 6pt, y: 7pt),
  table.header(
    ..("Désignation", "Qté", "PU HT", "TVA", "Total HT").map(h => text(8pt, weight: "bold", fill: muted, upper(h))),
  ),
  ..inv.lines.map(l => (
    [#l.name #if "description" in l [\ #text(8pt, fill: muted, l.description)]],
    [#number(l.quantity) #text(8pt, fill: muted, l.unit)],
    money(l.netPrice),
    [#number(l.vatRate) %],
    money(l.lineTotal),
  )).flatten(),
)

#v(6mm)

// --- totals -----------------------------------------------------------------

#let total-row(label, value, bold: false) = {
  let body = (label, money(value))
  if bold { body.map(strong) } else { body }
}

#grid(
  columns: (1fr, 70mm),
  gutter: 8mm,
  [
    #text(8pt, fill: muted, upper("Détail TVA"))
    #table(
      columns: (auto, 1fr, 1fr),
      align: (left, right, right),
      stroke: none,
      inset: (x: 4pt, y: 4pt),
      text(fill: muted)[Taux], text(fill: muted)[Base HT], text(fill: muted)[TVA],
      ..inv.taxBreakdown.map(t => (
        [#number(t.rate) % (#t.category)],
        money(t.basisAmount),
        money(t.calculatedAmount),
      )).flatten(),
    )
  ],
  table(
    columns: (1fr, auto),
    align: (left, right),
    stroke: none,
    inset: (x: 4pt, y: 5pt),
    ..total-row("Total HT", inv.totals.taxBasisTotal),
    ..total-row("TVA", inv.totals.at("taxTotal", default: 0)),
    table.hline(stroke: 0.8pt + accent),
    ..total-row("Total TTC", inv.totals.grandTotal, bold: true),
    ..if float(inv.totals.at("prepaid", default: 0)) != 0 {
      total-row("Déjà réglé", inv.totals.prepaid)
    },
    ..total-row("Net à payer", inv.totals.duePayable, bold: true),
  ),
)

// --- payment & notes --------------------------------------------------------

#if "paymentTerms" in inv [
  #v(8mm)
  #text(8pt, fill: muted, upper("Conditions de paiement")) \
  #inv.paymentTerms
]

#let means = inv.at("paymentMeans", default: ()).filter(m => "iban" in m)
#if means.len() > 0 [
  #v(6mm)
  #text(8pt, fill: muted, upper("Règlement par virement")) \
  #for m in means [
    IBAN #m.iban
    #if "bic" in m [ · BIC #m.bic]
    #if "accountName" in m [ · #m.accountName]
    \
  ]
]

#let notes = inv.at("notes", default: ())
#if notes.len() > 0 [
  #v(6mm)
  #set text(8pt, fill: muted)
  #for n in notes [#n.content \ ]
]

#v(1fr)
#align(center, text(7pt, fill: muted)[
  Facture électronique Factur-X (profil #sys.inputs.profile) — les données
  structurées (XML CII) sont embarquées dans ce PDF/A-3.
])
