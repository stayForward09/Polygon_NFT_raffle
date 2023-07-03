import { toast } from "react-toastify"

export const validationRaffle = (raffle: any) => {
  // if (raffle.project === '') {
  //   toast.error(`Input Project Name`)
  //   return
  // }

  if (raffle.image === '') {
    toast.error(`Select Image`)
    return false
  }

  if (raffle.price <= 0) {
    toast.error(`Price must bigger than 0`)
    return false
  }

  if (raffle.start_date.getTime() <= Date.now()) {
    toast.error(`Start Time must bigger than now`)
    return false
  }

  if (raffle.end_date.getTime() <= Date.now()) {
    toast.error(`End Time must bigger than Start Time`)
    return false
  }

  if (raffle.total_tickets <= 0) {
    toast.error(`Max Amount must bigger than 0`)
    return false
  }

  // if (raffle.twitter === '') {
  //   toast.error(`Input Twitter`)
  //   return false
  // }
  // if (raffle.discord === '') {
  //   toast.error(`Input Discord`)
  //   return false
  // }
  // if (raffle.description === '') {
  //   toast.error(`Input Description`)
  //   return false
  // }

  return true
}