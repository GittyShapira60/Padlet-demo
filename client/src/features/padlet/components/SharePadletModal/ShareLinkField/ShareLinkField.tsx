import { useState } from 'react';
import { Copy } from '../../../../../shared/icons/ui-icons';
import common from '../shareModalCommon.module.css';

interface ShareLinkFieldProps {
  shareUrl: string;
  onCopyError: () => void;
}

export default function ShareLinkField({
  shareUrl,
  onCopyError,
}: ShareLinkFieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopyError();
    }
  }

  return (
    <>
      <div className={common.surface}>
        <input
          className={`${common.fieldInput} ${common.fieldInputReadonly}`}
          type="text"
          value={shareUrl}
          readOnly
          aria-label="קישור ללוח"
          onFocus={(event) => event.target.select()}
        />
        <button
          type="button"
          className={common.iconButton}
          onClick={() => void handleCopyLink()}
          aria-label={copied ? 'הקישור הועתק' : 'העתק קישור'}
          title={copied ? 'הועתק!' : 'העתק קישור'}
        >
          <Copy size={18} />
        </button>
      </div>

      {copied ? <p className={common.successFeedback}>הקישור הועתק</p> : null}
    </>
  );
}
