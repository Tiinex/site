# Pilot Test — Human Execution Input

Use the two carried images in this exact order:

1. `01-motion-authority-walk-left-8phase.png` — motion authority.
2. `02-identity-authority-plaything-left-profile.png` — character identity authority.

Present the human with those two attachments and ask them to submit exactly this user-visible input to the external image-generation context:

```text
Jag har bifogat två bilder med separerade roller.

BILD 1 bestämmer rörelsen. Bevara samma åtta gångposer och samma ordning.
BILD 2 bestämmer karaktären. Återge samma mänskliga Plaything i samtliga åtta poser.

Skapa ett transparent 2×4 motion source sheet med exakt åtta isolerade helkroppsposer. Bevara naturlig mänsklig gång, motsatt armswing, konsekvent figurstorlek och tydligt tomrum mellan varje pose. Använd äkta transparent bakgrund med alpha. Lägg inte till text, ramar, etiketter, gridlinjer eller extra figurer.
```

## Return Boundary

When the external result is available, the human should attach the exact generated file back to Pilot. Pilot must preserve the returned bytes when available, record the actual attachment set and exact submitted text, then return a lineage-correct Handoff package to Anchor. Pilot does not decide whether the visual result is accepted.
