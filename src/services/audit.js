import { addDoc, collection } from "firebase/firestore";
import { db, nowTs } from "./firebase";

export async function logAudit({ actorUid, actorEmail, actorRole, action, targetType, targetId, meta = {} }) {
  try {
    await addDoc(collection(db, "auditLogs"), {
      actorUid: actorUid || "",
      actorEmail: actorEmail || "",
      actorRole: actorRole || "",
      action,
      targetType,
      targetId,
      meta,
      createdAt: nowTs(),
    });
  } catch {}
}
