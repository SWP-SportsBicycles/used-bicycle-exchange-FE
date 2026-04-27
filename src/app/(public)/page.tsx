/* eslint-disable @typescript-eslint/no-unused-vars */
import HomepageScreen from '@/modules/buyer/screens/HomepageScreen'
import { redirect } from 'next/navigation'

export default function Page() {
  redirect('/marketplace')
  // return <HomepageScreen />
}
