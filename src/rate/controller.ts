import { RequestHandler } from "express";

export const getRates: RequestHandler = async (req, res) => {
  const APP_ID = process.env.APP_ID;
  try {
    const rateRes = await fetch(
      "https://openexchangerates.org/api/latest.json?app_id=" + APP_ID
    );

    const data = await rateRes.json();

    res.json(data.rates);
  } catch (error: any) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
