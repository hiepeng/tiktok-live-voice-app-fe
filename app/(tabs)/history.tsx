import React, { useEffect, useRef } from "react";
import CommentHistory from "../../components/CommentHistory";

export default function HistoryScreen() {
  const ref = useRef<any>(null);

  useEffect(() => {
    // Gọi hàm fetchCommentHistory nếu có
    if (ref.current && typeof ref.current.fetchCommentHistory === "function") {
      ref.current.fetchCommentHistory(1);
    }
  }, []);

  return <CommentHistory ref={ref} standalone />;
}
