// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	// Esegui i middleware in sequenza
	const middlewares: ((request: NextRequest) => Promise<NextResponse | null>)[] = [];

	// Esecuzione sequenziale dei middleware
	for (const middlewareFn of middlewares) {
		const result = await middlewareFn(request);

		// Se un middleware restituisce una risposta, interrompi l'esecuzione
		if (result) {
			return result;
		}
	}

	// Procedi normalmente se nessun middleware blocca la richiesta
	return NextResponse.next();
}

// Configura il matcher per tutte le rotte
export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
