This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


1. วิเคราะห์โจทย์ที่ได้รับอย่างไร
ตอบ = เป็นโจทย์ที่ให้ใช้ Framework React เป็นตัวพัฒนา ให้ใช้ Map library , Mapbox ในการพัฒนา โดยโจทย์จะให้ API ที่มีข้อมูลมากกว่า 1 แสนข้อมูล โดยข้อมูลใน Api จะเป็นข้อมูล พิกัด  lat , long จาก library ที่ให้มา คือต้องการให้แสดงพิกัด ข้อมูล 1 แสนตำแหน่งขึ้นบน Map

2. แนวคิดในการออกแบบ UX/UI (ทำไมถึงมีหน้าตา และ function แบบนี้)
ตอบ = ตอนแรกตั้งใจจะให้เป็น Map ที่แสดงจุดตำแหน่งของร้านสะดวกซื้อที่มีทั้งหมด (ประมานว่าจุดตั้งของเซเว่น) แต่พอเข้าไปดูข้อมูลที่ได้จาก Api ข้อมูลส่วนเป็นข้อมูลที่แตกต่างกันแค่ lag , long กับ id เลยพยายามจะให้เป็นจุดแสดงตำแหน่ง ที่มีและอาจจะต้องขอโทษก่อนเลยครับ พอไม่มี Design แบบคร่าวๆ ให้ ผมไม่ค่อยมีจินตนาการเรื่องความสวยงามเท่าไรครับ แต่ function  ที่คิดไว้คืออยากให้แสดงตำแหน่ง ของ ร้านสะดวกซื้อ หลังจากการกด mark pin ที่จุดตำแหน่งนั้น อยากให้เข้าไปดู lag long 
รูปภาพ ของสถานที่โดยสามารถกำหนดเส้นทางการเดินทางจากจุดที่อยุ่ปัจจุบัน ไปหาจุดที่ต้องการได้ นั้นครับแนวคิด


3. หาองค์ความรู้ต่างๆ และศึกษา อย่างไร เช่น map lib, componance ui เป็นต้น
ตอบ = โดยส่วนใหญ่จะถามจากผู้ที่เคยใช้งานจริง เพื่อฟังแนวคิดการใช้งานก่อน จากนั้นจำ key word  มาค้นหาต่อด้วย Ai (chat GPT , claude) ว่าตัวไหนใช้งานยังไง พร้อมกับการอ่าน Doc ของ library  ควบคู่ไปด้วย จากนั้นก็ลองจากการแสดงข้อมูลตัวอย่างง่ายๆ หลัก 10 ข้อมูล ไปจนถึงข้อมูลจริงใน Api 


4. มีความเข้าใจในการเรียกใช้งาน api เพื่อนำผลลัพธ์มาแสดงผล
ตอบ = เป็นครั้งแรกที่ใช้ fetch ในการเรียก api อยากลองใช้งาน fetch ดู ปกติใช้ axios ตอนเขียน vue .js ปกติจะดึงข้อมูลทั้งหมดออกมาดูด้วย การ log ว่าได้ข้อมูลประมานไหนออกมาบ้าง แต่พอเป็นข้อมูลที่มีจำนวนหลักแสน การจะดึงข้อมูลจำนวนนั้นในครั้งเดียว อาจจะทำไม่ได้เลย เลยทำการแบ่งการเรียกใช้งาน api เป็นการแบ่งจำนวนในการ Get  โดยให้ดึงทีละ 10000 ข้อมูล (ไปหาข้อมูลมา ดึงที 1000 อาจจะทำให้ระบบดูดีกว่า แต่ตอนเอามาทำแบบทดสอบ มันใช้เวลานาน เลยใช้ 10000 ข้อมูล ต่อการดึง 1 รอบ) จนครบตามตำนวนทั้งหมดที่มีอยู่ 


5. มีความคิดเห็นอย่างไรกับโจทย์นี้ (ยาก หรือ ง่าย อย่างไร)
ตอบ = ยาก เพราะส่วนใหญ่พัฒนาโปรแกรมด้วย Vue , Nuxt เป็นส่วนใหญ่ (ในบริษัทเดิม) จึงต้องทวน React ใหม่พอสมควร และ MapLibre ก็เป็น library  ที่ยังไม่เคยได้ใช้งาน พอได้อ่านศึกษาและทำความเข้าใจ แล้วสามารถแสดงข้อมูลออกมาทีละ 10 , 1000 , 10000 ตามลำดับ แต่ไม่สามารถแสดงตำแหน่งข้อมูลหลัก 100000 ได้ เพราะปริมาณข้อมูลเยอะเกินไป จึงได้ไปหาข้อมูลเพิ่มเติม มีวิธีการจัดกลุ่ม รวมกลุ่มเข้าไป และใช้วิธีโหลดข้อมูล api แบบแบ่งส่วนเข้าไป ให้โหลดข้อมูล ทีละเป็นส่วน ช่วยในการทำงานให้ผ่านมาได้ 
