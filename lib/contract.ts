import PqTicketArtifact from "@/contracts/out/PqTicket.json";

export const PQTICKET_ABI = PqTicketArtifact.abi as readonly unknown[] as never[];
export const PQTICKET_BYTECODE = PqTicketArtifact.bytecode as `0x${string}`;
