"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateFromString } from "generate-avatar";
import { useState } from "react";

export default function AI_Agent_Avatar() {
  const [input, setInput] = useState("");
  const [image, setImage] = useState("");
  function generateRandomInput() {
    setInput(Math.random().toString(36).substring(2, 15));
    setImage(`data:image/svg+xml;utf8,${generateFromString(input)}`);
  }

  const imageUrl = `data:image/svg+xml;utf8,${generateFromString(input)}`;

  return (
    <div className=" flex justify-center max-w-xl mx-auto items-center h-[400px] gap-10">
      <div className=" flex min-w-[300px] gap-2 flex-col justify-start items-start">
        <Input
          placeholder="Enter your name"
          value={input}
          className=""
          onChange={(e) => setInput(e.target.value)}
        />
        <p className="text-xs my-1 font-mono uppercase opacity-50">
          OR
        </p>
        <div className="flex gap-2 justify-center items-center">
          <Button className="w-full" onClick={generateRandomInput}>Generate Random Input</Button>
        </div>
      </div>
      <img src={imageUrl} className="w-40 h-40 rounded-xl" />
      <div className="flex flex-col justify-center items-center"></div>
    </div>
  );
}
