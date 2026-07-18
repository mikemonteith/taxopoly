import type { Player } from "..";
import { type CardBoardTile } from "../static-data";
import { CHANCE_CARD_EFFECTS, COMMUNITY_CHEST_CARD_EFFECTS } from "../cards";
import { BoardTileState } from "./base";

export class ChanceBoardTileState extends BoardTileState<CardBoardTile> {
  landedOn(player: Player) {
    const card = this.engine.drawChanceCard();
    this.engine.log(`Chance card: ${card.description}`);
    CHANCE_CARD_EFFECTS[card.code](this.engine, player);
  }
}

export class CommunityChestBoardTileState extends BoardTileState<CardBoardTile> {
  landedOn(player: Player) {
    const card = this.engine.drawCommunityChestCard();
    this.engine.log(`Community Chest card: ${card.description}`);
    COMMUNITY_CHEST_CARD_EFFECTS[card.code](this.engine, player);
  }
}
