import { toast } from "react-toastify"

export const validationAuction = (auction: any) => {
  if (auction.project === '') {
    toast.error(`Input Project Name`)
    return
  }

  if (auction.image === '') {
    toast.error(`Select Image`)
    return false
  }

  if (auction.price <= 0) {
    toast.error(`Price must bigger than 0`)
    return false
  }

  if (auction.start_date.getTime() <= Date.now()) {
    toast.error(`Start Time must bigger than now`)
    return false
  }

  if (auction.end_date.getTime() <= Date.now()) {
    toast.error(`End Time must bigger than Start Time`)
    return false
  }

  if (auction.twitter === '') {
    toast.error(`Input Twitter`)
    return false
  }
  if (auction.discord === '') {
    toast.error(`Input Discord`)
    return false
  }
  if (auction.description === '') {
    toast.error(`Input Description`)
    return false
  }

  return true
}