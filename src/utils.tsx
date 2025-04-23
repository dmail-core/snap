export const MaxTitleSize = 100
// max content size 500
export const MaxContentSize = 480
export const DmailAi = "@dmail.ai"

export const con = (str: string, prefix = 5, suffix = 8, replaceText = '***') => {
  if (!str || typeof str !== 'string') return;
  const n = str.split("");
  return n.slice(0, prefix).join("") + replaceText + n.slice(-suffix).join("");
};

export const dealTo = (to: string) => {
  const aTo: string[] = to.split('@')
  if (aTo.length > 1) {
    const address = aTo[0] || ''
    return `${address.length > 12 ? con(address, 5, 3) : address}${DmailAi}`
  } else {
    return to
  }
}



export const replyEmail = async () => {
  
}