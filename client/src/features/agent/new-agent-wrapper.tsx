import { useState } from "react";
import CreateAgentWizard from "./create-agent-wizard";

export default function NewAgentWrapper({ onAgentCreated }: { onAgentCreated: () => void }) {
  return <CreateAgentWizard onComplete={onAgentCreated} />;
}
