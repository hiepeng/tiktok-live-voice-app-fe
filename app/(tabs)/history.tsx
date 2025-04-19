import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import CommentHistory from "../../components/CommentHistory";

export default function HistoryScreen() {
  const ref = React.useRef<any>(null);

  // Khi tab được focus, tự động fetch lại history
  useFocusEffect(
    React.useCallback(() => {
      // Gọi hàm fetchCommentHistory nếu có
      if (ref.current && typeof ref.current.fetchCommentHistory === "function") {
        ref.current.fetchCommentHistory(1);
      }
    }, [])
  );

  // Truyền ref vào CommentHistory (cần sửa CommentHistory để forwardRef)
  return <CommentHistory ref={ref} standalone />;
}
