import { getPlayerStats } from "@/pubg/lib/pubg"

export const BASE_URL = "https://api.pubg.com/shards/steam"

async function main(){
  const player_data = await getPlayerStats("Drag0nslayer1337", "duo-fpp")

}

main()