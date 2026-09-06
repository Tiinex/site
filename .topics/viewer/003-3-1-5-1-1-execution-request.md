# Pilot External Execution Request — UAL 8x8 Locomotion Master

## Human execution steps

1. Use an external image-generation context that accepts image attachments. Do not add a separate pre-prompt or additional visual references.
2. Attach **003-3-1-5-1-1-input-01-motion-direction-authority.png** first. Its SHA-256 is `04c20b0e3233c0840a35d7b9b8f06160bfb5a60a7bceadac84b53ca0a6f3ee88`.
3. Attach **003-3-1-5-1-1-input-02-identity-authority.png** second. Its SHA-256 is `ed54f4023c2c411686c199da8d48a7356f7f0171ae9102441a9cc14688b2c67b`.
4. Submit the exact user-visible input below without rewriting or adding requirements.
5. If the external surface asks only for confirmation before generation and does not materially change the requested transformation, answer only `Ja.` (or the minimum equivalent confirmation). If it proposes a material change, stop and return the deviation to Pilot rather than silently accepting it.
6. When generation completes, return the exact generated file to Pilot when the host exposes it. If the generated file is already exposed in the same Pilot conversation, a single `.` may be used to return control so Pilot can capture it. Do not manually resave, screenshot, crop, or postprocess the generated source for the return.

## Exact user-visible input

```text
Jag har bifogat två bilder med strikt separerade roller.

BILD 1 är motion- och directional authority.
Den visar den gångrörelse, tidsordning och de åtta observationsriktningar som den färdiga 8×8 locomotion sheeten ska följa.

Bevara rörelsen från Bild 1 så nära som möjligt.
Varje rad ska vara samma fullständiga gångcykel sedd från den riktning som motsvarande rad i Bild 1 visar.
Varje kolumn ska motsvara samma tidpunkt i gångcykeln över alla åtta riktningar.

BILD 2 är character identity authority.
Alla 64 figurer ska föreställa exakt samma mänskliga Plaything som i Bild 2: samma person, ansikte, hår, proportioner, goggles, Edwardian-steampunk arbetskläder, stövlar, verktygsbälte, väskor, material och visuella stil.

Bild 1 bestämmer rörelsen, tidsordningen och riktningarna.
Bild 2 bestämmer karaktärens identitet och utseende.

Skapa ett rent transparent 8×8 locomotion master sheet med exakt 64 helkroppsposer.

Varje cell ska innehålla exakt en figur.
Håll figuren konsekvent centrerad och i samma skala inom varje cell.
Lämna en liten osynlig säkerhetsmarginal runt varje figur så att ingen hand, fot, hårdel, väska eller annan accessoar når eller överlappar en angränsande cell.

Använd äkta transparent bakgrund med alpha.

Kopiera inte de färgkodade linjerna eller mannequin-stilen från Bild 1 till slutbilden. De används endast för att beskriva kroppens rörelse och riktning.

Lägg inte till text, siffror, labels, gridlinjer, ramar, rubriker, paneler, posterlayout eller extra figurer.

Slutbilden ska endast innehålla de 64 isolerade karaktärsposerna i samma 8×8-struktur som Bild 1.
```

## Execution boundary

- Pilot guides this bounded external action and records what actually happened.
- Pilot does not visually accept, reject, redesign, repair, repack, or promote the result.
- Anchor retains visual review, deterministic postprocess, acceptance, and promotion.
- Exact human-visible input does not prove provider-internal prompt equivalence; observable host/provider rewriting must be recorded as an execution anomaly.
