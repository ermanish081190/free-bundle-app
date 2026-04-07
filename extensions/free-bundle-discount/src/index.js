// @ts-nocheck

function coreLogic(input) {
  const discounts = [];
  const bundles = input?.shop?.metafield?.jsonValue || [];

  if (!Array.isArray(bundles) || bundles.length === 0) {
    return { operations: [] };
  }

  for (const bundle of bundles) {
    const triggerProductId = bundle.triggerProductId;
    const buyQty = Number(bundle.buyQty || 1);
    const freeProducts = bundle.freeProducts || [];

    if (!triggerProductId || !freeProducts.length) continue;

    // 🔹 Count trigger quantity (ANY variant of product)
    let triggerQty = 0;

    for (const line of input.cart.lines) {
       console.log("CART ITEM LINE DETAIL:", JSON.stringify(line, null, 2));
      if (line?.merchandise?.product?.id === triggerProductId) {
        triggerQty += line.quantity || 0;
      }
    }

    if (triggerQty < buyQty) continue;

    // 🔥 Handle same product case
    const sameProductFree = freeProducts.find(
      f => f.productId === triggerProductId
    );

    let multiplier;

    if (sameProductFree) {
      const bundleSize = buyQty + sameProductFree.qty;
      multiplier = Math.floor(triggerQty / bundleSize);
    } else {
      multiplier = Math.floor(triggerQty / buyQty);
    }

    if (multiplier <= 0) continue;

    const targets = [];

    for (const free of freeProducts) {
      const targetProductId = free.productId;
      let remainingQty = free.qty * multiplier;

      if (!targetProductId || remainingQty <= 0) continue;

      for (const line of input.cart.lines) {
        const productId = line?.merchandise?.product?.id;
        const variantId = line?.merchandise?.id;
        const lineId = line.id;
        const qty = line.quantity || 0;

        if (!productId || !lineId) continue;

        if (productId === targetProductId && remainingQty > 0) {
          const applyQty = Math.min(qty, remainingQty);

          targets.push({
            cartLine: {
              id: lineId,
              quantity: applyQty,
            },
          });

          remainingQty -= applyQty;
        }
      }
    }

    if (targets.length > 0) {
      discounts.push({
        message: "FREEBUNDLE",
        targets,
        value: {
          percentage: { value: 100 },
        },
      });
    }
  }

  if (!discounts.length) {
    return { operations: [] };
  }

  return {
    operations: [
      {
        productDiscountsAdd: {
          selectionStrategy: "FIRST",
          candidates: discounts,
        },
      },
    ],
  };
}

// ✅ REQUIRED EXPORTS
export function cartLinesDiscountsGenerateRun(input) {
  return coreLogic(input);
}

export function cartDeliveryOptionsDiscountsGenerateRun(input) {
  return { operations: [] };
}
