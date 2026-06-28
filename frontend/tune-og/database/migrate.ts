import type { SQLiteDatabase } from "expo-sqlite";

import migration1 from "database/migrations/06-27-26_create_settings_table";
import migration2 from "database/migrations/06-28-26_init_settings";

export async function migrate(db: SQLiteDatabase) {

    const migrations = [
        migration1,
        migration2
    ];

    // metadata
    const result = await db.getFirstAsync<{ user_version: number }>(
        "PRAGMA user_version;"
    );

    const version = result?.user_version ?? 0;

    for (let i = version; i < migrations.length; i++) {
        await db.withTransactionAsync(async () => {
            await db.execAsync(migrations[i]);
            await db.execAsync(`PRAGMA user_version = ${i + 1};`);
        });
    }

    console.log("Database version: ", version);
}