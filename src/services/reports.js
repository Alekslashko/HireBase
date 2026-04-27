import { addDoc, collection } from "firebase/firestore";
import { db, nowTs } from "./firebase";

export async function reportPost({ postId, postOwnerUid, reporterUid, reporterEmail, reason }) {
  return addDoc(collection(db, "reports"), {
    type: "post",
    postId,
    postOwnerUid: postOwnerUid || "",
    reporterUid: reporterUid || "",
    reporterEmail: reporterEmail || "",
    reason: (reason || "").trim(),
    createdAt: nowTs(),
    status: "open",
  });
}
