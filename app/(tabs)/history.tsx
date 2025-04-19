import React from "react";
import CommentHistory from "../../components/CommentHistory";

export default function HistoryScreen() {
  // CommentHistory expects 'visible' and 'onClose' props when used as a modal, but as a standalone screen, render directly
  return (
    <CommentHistory standalone />
  );
}
