from pathlib import Path


ROOT = Path(__file__).resolve().parent
FEEDBACK_PAGE = ROOT / "src/app/feedback/page.tsx"


def replace_once(content: str, old: str, new: str) -> str:
    if new in content:
        return content
    if old not in content:
        raise RuntimeError("Expected feedback page text was not found")
    return content.replace(old, new, 1)


def main() -> None:
    content = FEEDBACK_PAGE.read_text()

    content = replace_once(
        content,
        'import { useState, useEffect, Suspense } from "react";',
        'import { useState, useEffect, Suspense, useMemo } from "react";',
    )
    content = replace_once(
        content,
        "  status: string;\n}",
        "  status: string;\n  speaker?: string;\n}",
    )
    content = replace_once(
        content,
        '    comments: "",\n  });',
        '    comments: "",\n    speakerRatings: {} as Record<string, number>,\n  });',
    )
    content = replace_once(
        content,
        'setFormData({ name: "", email: "", year: "1", department: "", eventName: "", rating: 5, comments: "" });',
        'setFormData({ name: "", email: "", year: "1", department: "", eventName: "", rating: 5, comments: "", speakerRatings: {} });',
    )
    content = replace_once(
        content,
        'body: JSON.stringify(formData),',
        "body: JSON.stringify({ ...formData, comments: finalComments }),",
    )
    content = replace_once(
        content,
        '<label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Rating *</label>',
        '<label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">{speakers.length > 1 ? "Event Overall Rating *" : "Rating *"}</label>',
    )

    FEEDBACK_PAGE.write_text(content)


if __name__ == "__main__":
    main()
